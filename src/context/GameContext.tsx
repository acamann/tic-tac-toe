import { createContext, useContext, useState } from "react";
import { GameBoard } from "../types/models";
import { getNewBoard, getWinner, isDraw, isValidMove } from "../utils/BoardUtils";
import { useAuth } from "./AuthContext";
import { useDB } from "./DBContext";
import { useAblyRealtime } from "./AblyRealtimeContext";

type GameEntity = {
  game_id: string;
  board: GameBoard;
  player0: string;
  player1: string;
  current_turn: boolean | null;
  winner: string | null;
  is_draw: boolean | null;
}

type Game = Omit<GameEntity, 'current_turn'> & {
  current_turn: 0 | 1 | null;
  self: 0 | 1; // client-side only
}

type GameContextType = {
  game: Game | undefined;
  pairingCode: string;
  createGame: () => Promise<void>;
  joinGame: (joinCode: string) => Promise<void>;
  handleMove: (rowIndex: 0 | 1 | 2, colIndex: 0 | 1 | 2) => void;
  error: string;
  isLoading: boolean;
}

const GameContext = createContext<GameContextType>({} as GameContextType);

const GameContextProvider = ({ children }: React.PropsWithChildren) => {
  const [pairingCode, setPairingCode] = useState<string>("");
  const [game, setGame] = useState<Game | undefined>(undefined);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuth();
  const { supabase } = useDB();
  const { client: realtimeClient } = useAblyRealtime();

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

  const subscribeToLobby = (code: string, expiration: number) => {
    const clearTimeouts = () => {
      if (expirationTimer) clearTimeout(expirationTimer);
    }
    
    const expirationTimer = setTimeout(() => {
      setError("Pairing code expired");
      setPairingCode("");
      unsubscribe();
    }, expiration * 1000);

    const unsubscribe = () => {
      if (channel) {
        channel.unsubscribe();
        channel.detach(); // need to detach to release channel, unsubscribe doesn't cut it
      }
    }

    const channel = realtimeClient.channels.get(code);
    channel.subscribe((message) => {
      if (message.name === "game") {
        const game = JSON.parse(message.data) as GameEntity;

        setGame({
          ...game,
          current_turn: game.current_turn === true ? 1 : game.current_turn === false ? 0 : null,
          self: 0
        });
        setPairingCode("");

        subscribeToGameChanges(game.game_id);
      }
      clearTimeouts();
      unsubscribe();
    });
  }

  const createGame = async () => {
    setError("");

    setIsLoading(true);
    // TODO: remove player name from param and replace with auth0 access token
    const resp = await fetch(`/api/pair?player=${user?.email}`);
    setIsLoading(false);

    if (!resp.ok) {
      setError("Could not create game");
      return;
    }

    const { code, expiration } = await resp.json();
    setPairingCode(code);

    subscribeToLobby(code, expiration);
  };

  const joinGame = async (joinCode: string) => {
    setIsLoading(true);
    // TODO: remove player name from param and replace with auth0 access token
    const resp = await fetch(`/api/join?code=${joinCode}&player=${user?.email}`);
    setIsLoading(false);

    if (resp.status !== 200) {
      // TODO: better error stuff
      setError("Could not join");
      console.error("Could not join", resp);
    }

    const { game } = await resp.json() as { game: GameEntity };

    setGame({
      ...game,
      current_turn: game.current_turn === true ? 1 : game.current_turn === false ? 0 : null,
      self: 1
    });

    subscribeToGameChanges(game.game_id);
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
        isLoading
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

const useGameContext = () => useContext(GameContext);

export { GameContext as default, GameContextProvider, useGameContext };