import { createContext, useContext, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { GameBoard } from "../types/models";
import { getNewBoard, getWinner, initialBoardState, isValidMove } from "./BoardUtils";

const generatePairingCode = (): string => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < 4) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

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
  current_turn: boolean;
  self: 0 | 1;
  winner: 0 | 1;
}

type GameContextType = {
  game: Game | undefined;
  pairingCode: string;
  createGame: () => Promise<void>;
  joinGame: (joinCode: string) => void;
  handleMove: (rowIndex: 0 | 1 | 2, colIndex: 0 | 1 | 2) => void;
  username: string;
  setUsername: (value: string) => void;
  error: string;
}

const GameContext = createContext<GameContextType>({
  game: undefined,
  pairingCode: "",
  createGame: async () => { return; },
  joinGame: () => { return; },
  handleMove: () => { return; },
  username: "",
  setUsername: () => { return; },
  error: ""
});

const GameContextProvider = ({ children }: React.PropsWithChildren) => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const [pairingCode, setPairingCode] = useState<string>("");
  const [game, setGame] = useState<Game | undefined>(undefined);

  const handleMove = async (rowIndex: 0 | 1 | 2, colIndex: 0 | 1 | 2) => {
    try
    {
      if (!game) {
        throw new Error("Unknown game");
      }
      if (game.winner) {
        throw new Error(`Game is over! Player ${+game.winner + 1} wins!`)
      }
      if (+game.current_turn !== game.self) {
        game && console.log(+game.current_turn, game.self)
        throw new Error("It's not your turn");
      }
      if (!isValidMove) {
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
          current_turn: winner === null ? !game.current_turn : null,
          winner
        })
        .eq('game_id', game.game_id)

      if (error) {
        setError(error.message);
      }
    } catch (e) {
      setError((e as { message: string }).message ?? "Unknown Problem");
    }
  }

  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  // const initializeUser = () => {
  //   const user = supabase.auth.user();
  //   let username;
  //   if (user) {
  //     username = user.user_metadata.user_name;
  //   } else {
  //     const storedUsername = localStorage.getItem("username");
  //     if (storedUsername) {
  //       username = storedUsername;
  //     } else {
  //       // prompt user to create username
  //     }
  //   }
  //   setUsername(username);
  //   localStorage.setItem("username", username);
  // };

  const subscribeToGameChanges = (game_id: string) => {
    const channel = supabase
    .channel('game')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'Games',
      },
      async (payload) => {
        if (payload.old.game_id !== game_id) {
          // TODO: implement auth & RLS
          //   to prevent everyone getting spammed by everyone elses game
          return;
        }

        setGame(current => ({
          ...current,
          ...payload.new
        } as Game));

        if (payload.new.winner) {
          channel.unsubscribe();
        }
      }
    )
    .subscribe()
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
    const player0 = username;
    const { error } = await supabase
      .from('PairingCodes')
      .insert({ code, player0 });

    if (error) {
      setError(error.message);
    } else {
      setPairingCode(code);

      const pairingChannel = supabase
        .channel('pairing')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'PairingCodes',
          },
          async (payload) => {
            if (payload.new.code !== code) {
              return;
            }
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
        player1: username,
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
        player1: username,
        game_id: gameData.game_id
      })
      .eq('code', joinCode);

    if (error) {
      setError(error.message);
    } else {
      setGame({
        ...gameData,
        self: 1
      });
    }
  };

  return (
    <GameContext.Provider
      value={{
        //supabase,
        //auth: supabase.auth,
        username,
        setUsername,
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