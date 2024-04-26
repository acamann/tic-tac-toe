import { GameContextProvider, useGameContext } from "./context/GameContext";
import Authenticate from "./components/Authenticate";
import Game from "./components/Game";
import { useMemo } from "react";
import { UserProvider, useUser } from "@auth0/nextjs-auth0/client";
import Lobby from "./components/Lobby";
import { Provider } from "react-redux";
import { store } from "./store";

const App = () => {
  const { isLoading: isAuthLoading, error: authError, user } = useUser();
  const { game, error: gameError } = useGameContext();

  const error = useMemo(
    () => authError?.message ?? gameError,
    [authError, gameError],
  );

  return (
    <>
      <h1>Tic Tac Toe</h1>
      {error && <div className="error">{error}</div>}
      {isAuthLoading ? (
        "Loading..."
      ) : !user ? (
        <Authenticate />
      ) : !game ? (
        <Lobby />
      ) : (
        <Game />
      )}
    </>
  );
};

const AppWrapper = () => {
  return (
    <Provider store={store}>
      <UserProvider>
        <GameContextProvider>
          <App />
        </GameContextProvider>
      </UserProvider>
    </Provider>
  );
};

export default AppWrapper;
