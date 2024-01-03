import { createContext, useContext, useState } from "react";
import { GameBoard } from "../types/models";
import { getNewBoard, getWinner, initialBoardState, isDraw, isValidMove } from "../utils/BoardUtils";
import { useAuth } from "./AuthContext";
import { useDB } from "./DBContext";

import * as Ably from 'ably';
if (!import.meta.env.VITE_ABLY_API_KEY) {
  throw new Error("Missing VITE_ABLY_API_KEY");
}
const client = new Ably.Realtime(import.meta.env.VITE_ABLY_API_KEY);

type Game = {
  game_id: string;
  board: GameBoard;
  player0: string;
  player1: string;
  current_turn: 0 | 1 | null; // true/false/null in DB
  winner: string | null;
  is_draw: boolean | null;
  self: 0 | 1; // client-side only
}

type GameContextType = {
  game: Game | undefined;
  pairingCode: string;
  createGame: () => Promise<void>;
  joinGame: (joinCode: string) => Promise<void>;
  handleMove: (rowIndex: 0 | 1 | 2, colIndex: 0 | 1 | 2) => void;
  error: string;
}

const GameContext = createContext<GameContextType>({} as GameContextType);

const GameContextProvider = ({ children }: React.PropsWithChildren) => {
  const [pairingCode, setPairingCode] = useState<string>("");
  const [game, setGame] = useState<Game | undefined>(undefined);
  const [error, setError] = useState("");

  const { user } = useAuth();
  const { supabase } = useDB();

  const handleMove = async (rowIndex: 0 | 1 | 2, colIndex: 0 | 1 | 2) => {
    setError("");
    try
    {
      if (!game) {
        throw new Error("Unknown game");
      }
      if (game.is_draw || game.winner) {
        throw new Error(`The game is already over.`)
      }
      if (game.current_turn !== game.self) {
        throw new Error("It's not your turn");
      }
      if (!isValidMove(game.board, { player: game.current_turn, rowIndex, colIndex })) {
        throw new Error("Invalid move");
      }

      const newBoard = getNewBoard(game.board, {
        player: game.self,
        rowIndex,
        colIndex
      });

      const winner = getWinner(newBoard);

      const { error } = await supabase
        .from('Games')
        .update({
          board: newBoard,
          current_turn: winner === null ? (game.current_turn === 0 ? true : false) : null,
          winner: winner === 0 ? game.player0 : winner === 1 ? game.player1 : null,
          is_draw: isDraw(newBoard)
        })
        .eq('game_id', game.game_id)

      if (error) {
        setError(error.message);
      }
    } catch (e) {
      setError((e as { message: string }).message ?? "Unknown Problem");
    }
  }

  const subscribeToGameChanges = (game_id: string) => {
    const channel = supabase
      .channel(`${user?.email}${game_id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'Games',
          filter: `game_id=eq.${game_id}`
        },
        async (payload) => {
          setError("");

          setGame(current => ({
            ...current,
            ...payload.new,
            current_turn: payload.new.current_turn === true ? 1 : payload.new.current_turn === false ? 0 : null,
          } as Game));

          if (payload.new.winner !== null || payload.new.is_draw) {
            channel.unsubscribe();
          }
        }
      )
      .subscribe();
  }

  const createGame = async () => {
    setError("");

    const resp = await fetch(`/api/pair`);

    if (!resp.ok) {
      console.error(resp);
      setError("Could not join game");
      return;
    }

    const { code, expiration } = await resp.json();
    setPairingCode(code);

    const clearTimeouts = () => {
      if (expirationTimer) clearTimeout(expirationTimer);
    }
    const unsubscribe = () => {
      if (channel) {
        channel.unsubscribe();
        channel.detach(); // need to detach to release channel, unsubscribe doesn't cut it
      }
    }

    const channel = client.channels.get(code);
    channel.subscribe((message) => {
      console.log("message!");
      console.log(message);
      // specifically for now we care about message where name = gameId, but let's send em all

      if (message.name === "gameId") {
        const gameId = message.data;
        console.log(gameId);
        setGame({
          game_id: gameId,
          board: initialBoardState,
          player0: "dummy",
          player1: "dummy2",
          is_draw: null,
          winner: null,
          current_turn: 0,
          self: 0
        });
        setPairingCode("");
      }
      clearTimeouts();
      unsubscribe();
    });

    const expirationTimer = setTimeout(() => {
      setError("Pairing code expired");
      setPairingCode("");
      unsubscribe();
    }, expiration * 1000)
  };

  const joinGame = async (joinCode: string) => {
    const resp = await fetch(`/api/join?code=${joinCode}`);

    if (resp.status !== 200) {
      // TODO: better error stuff
      setError("Could not join");
      console.error("Could not join", resp);
    }

    const { gameId } = await resp.json() as { gameId: string };
    setError("");
    subscribeToGameChanges(gameId);

    setGame({
      game_id: gameId,
      board: initialBoardState,
      player0: "dummy",
      player1: "dummy2",
      is_draw: null,
      winner: null,
      current_turn: 0,
      self: 1
    });
  };

  return (
    <GameContext.Provider
      value={{
        pairingCode,
        game,
        createGame,
        joinGame,
        handleMove,
        error,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

const useGameContext = () => useContext(GameContext);

export { GameContext as default, GameContextProvider, useGameContext };