import { createContext, useContext } from "react";
import { Game } from "../types/models";
import {
  useLazyGetGameQuery,
  useStartGameMutation,
  useTakeTurnMutation,
} from "../services/games";

// TODO: remove this context layer entirely

type GameContextType = {
  game: Game | undefined;
  startGame: (roomId: string) => Promise<void>;
  joinGame: (joinCode: string) => void;
  handleMove: (rowIndex: 0 | 1 | 2, colIndex: 0 | 1 | 2) => void;
  error: string;
  isLoading: boolean;
};

const GameContext = createContext<GameContextType>({} as GameContextType);

const GameContextProvider = ({ children }: React.PropsWithChildren) => {
  const [getGameQuery, { currentData: game, isLoading }] = useLazyGetGameQuery(
    {},
  );
  const [startGameTrigger] = useStartGameMutation();
  const [takeTurn] = useTakeTurnMutation();

  // TODO: display errors
  const error = "";

  const handleMove = async (rowIndex: 0 | 1 | 2, colIndex: 0 | 1 | 2) => {
    if (!game) {
      console.error("Handle Move on undefined game");
      return;
    }
    takeTurn({
      gameId: game?.game_id,
      body: {
        rowIndex,
        colIndex,
      },
    });
  };

  const joinGame = (gameId: string) => getGameQuery(gameId);

  const startGame = async (roomId: string) => {
    const newGame = await startGameTrigger({ room_id: roomId }).unwrap();
    await getGameQuery(newGame.game_id);
  };

  return (
    <GameContext.Provider
      value={{
        startGame,
        game,
        joinGame,
        handleMove,
        error,
        isLoading,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

const useGameContext = () => useContext(GameContext);

export { GameContext as default, GameContextProvider, useGameContext };
