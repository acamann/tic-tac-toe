import './App.css'
import { GameContextProvider, useGameContext } from './context/GameContext'
import Authenticate from './components/Authenticate'
import GameSetup from './components/GameSetup'
import Game from './components/Game'
import AblyRealtimeProvider from './context/AblyRealtimeContext'
import { useMemo } from 'react'
import { UserProvider, useUser } from '@auth0/nextjs-auth0/client'
import RoomTest from './components/RoomTest'

const App = () => {
  const { isLoading: isAuthLoading, error: authError, user } = useUser();
  const { game, error: gameError } = useGameContext();

  const error = useMemo(() => authError?.message ?? gameError, [authError, gameError]);

  return (
    <>
      <h1>Tic Tac Toe</h1>
      {error && <div className="error">{error}</div>}
      { isAuthLoading ? (
        "Loading..."
      ) : !user ? (
        <Authenticate />
      ) : !game ? (
          <RoomTest />
          // <GameSetup />
      ) : (
        <Game />
      )}
    </>
  )
}

const AppWrapper = () => {

  return (
    <AblyRealtimeProvider>
      <UserProvider>
        <GameContextProvider>
          <App />
        </GameContextProvider>
      </UserProvider>
    </AblyRealtimeProvider>
  )
}

export default AppWrapper
