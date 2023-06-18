import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { GameBoard } from "../types/models";

const generatePairingCode = (): string => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < 6) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

type Game = {
  pairingCode: string;
  board: GameBoard;
}

const initialBoardState: GameBoard = [
  [undefined, undefined, undefined],
  [undefined, undefined, undefined],
  [undefined, undefined, undefined],
]

type GameContextType = {
  game: Game | undefined;
  createGame: () => Promise<void>;
  handleMove: (rowIndex: 0 | 1 | 2, colIndex: 0 | 1 | 2) => void;
  error: string;
}

const GameContext = createContext<GameContextType>({
  game: undefined,
  createGame: async () => { return; },
  handleMove: () => { return; },
  error: ""
});

const GameContextProvider = ({ children }: React.PropsWithChildren) => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const [game, setGame] = useState<Game | undefined>(undefined);
  const [isXTurn, setIsXTurn] = useState(true);

  const handleMove = (rowIndex: 0 | 1 | 2, colIndex: 0 | 1 | 2) => {
    setGame(existing => {
      if (!existing) return undefined;
      return {
        ...existing,
        board: existing.board.map((row, i) => {
          if (i !== rowIndex) return row;
          else {
            return row.map((square, j) => {
              if (j !== colIndex) return square;
              else {
                return isXTurn ? "X" : "O";
              }
            });
          }
        }) as GameBoard
      }
    });
    setIsXTurn(existingValue => !existingValue);
  }

  //const [username, setUsername] = useState("");
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
    const player_id = "andy";
    const { error } = await supabase
      .from('PairingCodes')
      .insert({ code, player_id });

    if (error) {
      setError(error.message);
    } else {
      setGame(game => ({
        ...game,
        pairingCode: code,
        board: initialBoardState
      }));
    }
  };

  return (
    <GameContext.Provider
      value={{
        //supabase,
        //auth: supabase.auth,
        //username,
        //setUsername,
        game,
        createGame,
        //joinGame,
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