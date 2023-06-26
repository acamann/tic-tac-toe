import { createContext, useContext, useState } from "react";
import { GameBoard } from "../types/models";
import { getNewBoard, getWinner, initialBoardState, isDraw, isValidMove } from "../utils/BoardUtils";
import { useAuth } from "./AuthContext";
import { useDB } from "./DBContext";
import { generatePairingCode } from "../utils/PairingUtils";

type PairingCodesData = {
  code: string;
  player1_id: string;
  player2_id: string;
  game_id: string;
}

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

  const handlePairingComplete = async (data: PairingCodesData): Promise<boolean> => {
    const { data: gameDataResult, error: getGameDataError } = await supabase
      .from('Games')
      .select()
      .eq("game_id", data.game_id);

    if (getGameDataError) {
      setError(getGameDataError.message);
      return false;
    }

    const gameData = gameDataResult[0];

    setGame({
      ...gameData,
      current_turn: gameData.current_turn === true ? 1 : gameData.current_turn === false ? 0 : null,
      self: 0
    });

    subscribeToGameChanges(data.game_id);
    return true;
  }

  const deletePairingCode = async (code: string) => {
    await supabase
      .from('PairingCodes')
      .delete()
      .eq("code", code);
  }

  const createGame = async () => {
    setError("");

    if (pairingCode) {
      // delete old pairing code we are about to replace
      await deletePairingCode(pairingCode);
    }

    const code = generatePairingCode();
    const player0 = user?.email;
    const { error } = await supabase
      .from('PairingCodes')
      .insert({ code, player0 });

    if (error) {
      setError(error.message);
    } else {
      setPairingCode(code);

      const pairingChannel = supabase
        .channel(`${user?.email}-${code}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'PairingCodes',
            filter: `code=eq.${code}`
          },
          async (payload) => {
            if (await handlePairingComplete(payload.new as PairingCodesData)) {
              setPairingCode("");

              // remove pairing code since pairing is complete
              await deletePairingCode(code);

              pairingChannel.unsubscribe();
            }
          }
        )
        .subscribe()
    }
  };

  const joinGame = async (joinCode: string) => {
    setError("");

    // does the pairing code exist & is it not yet paired
    const { data: pairingDataResult, error: availabilityCheckError } = await supabase
      .from('PairingCodes')
      .select("player0, player1")
      .eq('code', joinCode);

    if (availabilityCheckError) {
      setError(availabilityCheckError.message);
      return;
    }

    if (pairingDataResult.length === 0) {
      setError("No matching Pairing Code found.");
      return;
    }

    const pairingData = pairingDataResult[0];

    if (pairingData.player1 !== null) {
      setError("Two players have already paired with this code.");
      return;
    }

    // create a new game
    const { data: gameDataResult, error: createGameError } = await supabase
      .from('Games')
      .insert({
        player0: pairingData.player0,
        player1: user?.email,
        board: initialBoardState,
        current_turn: 0
      })
      .select();

    if (createGameError) {
      setError(createGameError.message);
      return;
    }

    const gameData = gameDataResult[0];

    subscribeToGameChanges(gameData.game_id);

    // complete the pairing data so the host gets the game id via subscription
    const { error } = await supabase
      .from('PairingCodes')
      .update({
        player1: user?.email,
        game_id: gameData.game_id
      })
      .eq('code', joinCode);

    if (error) {
      setError(error.message);
    } else {
      setGame({
        ...gameData,
        current_turn: gameData.current_turn === true ? 1 : gameData.current_turn === false ? 0 : null,
        self: 1
      });
    }
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