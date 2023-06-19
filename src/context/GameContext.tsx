import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { GameBoard } from "../types/models";

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

type Game = {
  id: string;
  board: GameBoard;
  player1: string;
  player2: string;
  self: 1 | 2;
  currentTurn: 1 | 2;
}

const initialBoardState: GameBoard = [
  [undefined, undefined, undefined],
  [undefined, undefined, undefined],
  [undefined, undefined, undefined],
]

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
  //const [isXTurn, setIsXTurn] = useState(true);

  const handleMove = (rowIndex: 0 | 1 | 2, colIndex: 0 | 1 | 2) => {
    // setGame(existing => {
    //   if (!existing) return undefined;
    //   return {
    //     ...existing,
    //     board: existing.board.map((row, i) => {
    //       if (i !== rowIndex) return row;
    //       else {
    //         return row.map((square, j) => {
    //           if (j !== colIndex) return square;
    //           else {
    //             return isXTurn ? "X" : "O";
    //           }
    //         });
    //       }
    //     }) as GameBoard
    //   }
    // });
    // setIsXTurn(existingValue => !existingValue);
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

  useEffect(() => {
    return () => {
      console.log("useEffect unmount");
    };
  }, []);

  // const getMessagesAndSubscribe = async () => {
  //   setError("");
  //   if (!mySubscription) {
  //     getInitialMessages();
  //     mySubscription = supabase
  //       .from("messages")
  //       .on("*", (payload) => {
  //         handleNewMessage(payload);
  //       })
  //       .subscribe();
  //   }
  // };

  const createGame = async () => {
    setError("");
    const code = generatePairingCode();
    const player1_id = username;
    const { error } = await supabase
      .from('PairingCodes')
      .insert({ code, player1_id });

    if (error) {
      setError(error.message);
    } else {
      setPairingCode(code);
    }
  };

  useEffect(() => {
    let intervalId: NodeJS.Timer;
    if (pairingCode) {
      intervalId = setInterval(async () => {
        const { data, error } = await supabase
          .from('PairingCodes')
          .select("game_id")
          .eq("code", pairingCode);

        if (error) {
          setError(error.message);
          clearInterval(intervalId);
          return;
        }

        if (data[0].game_id) {
          setPairingCode("");
          clearInterval(intervalId);
          const { data: gameDataResult, error: getGameDataError } = await supabase
            .from('Games')
            .select()
            .eq("game_id", data[0].game_id);

          if (getGameDataError) {
            setError(getGameDataError.message);
            return;
          }

          const gameData = gameDataResult[0];

          setGame({
            id: gameData.game_id,
            board: gameData.board,
            player1: gameData.player1_id,
            player2: gameData.player2_id,
            self: 1,
            currentTurn: 1
          })
        }

      }, 2000)
    }
    return () => {
      clearInterval(intervalId)
    }
  }, [pairingCode]);

  const joinGame = async (joinCode: string) => {
    setError("");

    // does the pairing code exist & is it not yet paired
    const { data: pairingDataResult, error: availabilityCheckError } = await supabase
      .from('PairingCodes')
      .select("player1_id, player2_id")
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

    if (pairingData.player2_id !== null) {
      setError("Two players have already paired with this code.");
      return;
    }

    // create a new game
    const { data: gameDataResult, error: createGameError } = await supabase
      .from('Games')
      .insert({
        player1_id: pairingData.player1_id,
        player2_id: username,
        board: initialBoardState
      })
      .select("game_id, board");

    if (createGameError) {
      setError(createGameError.message);
      return;
    }

    const gameData = gameDataResult[0];

    // complete the pairing data so the host gets the game id via subscription
    const { error } = await supabase
      .from('PairingCodes')
      .update({
        player2_id: username,
        game_id: gameData.game_id
      })
      .eq('code', joinCode);

    if (error) {
      setError(error.message);
    } else {
      setGame({
        id: gameData.game_id,
        board: gameData.board,
        player1: pairingData.player1_id,
        player2: username,
        self: 2,
        currentTurn: 1
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