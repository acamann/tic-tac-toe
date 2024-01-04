import './App.css'
import { GameContextProvider, useGameContext } from './context/GameContext'
import AuthProvider, { useAuth } from './context/AuthContext'
import Authenticate from './components/Authenticate'
import GameSetup from './components/GameSetup'
import Game from './components/Game'
import DBProvider from './context/DBContext'
import AblyRealtimeProvider from './context/AblyRealtimeContext'

const App = () => {
  const { user } = useAuth();
  const { game, error } = useGameContext();

  return (
    <>
      <h1>Tic Tac Toe</h1>
      {error && <div className="error">{error}</div>}
      { !user ? (
        <Authenticate />
      ) : !game ? (
        <GameSetup />
      ) : (
        <Game />
      )}
    </>
  )
}

const AppWrapper = () => {

  return (
    <DBProvider>
      <AblyRealtimeProvider>
        <AuthProvider>
          <GameContextProvider>
            <App />
          </GameContextProvider>
        </AuthProvider>
      </AblyRealtimeProvider>
    </DBProvider>
  )
}

export default AppWrapper
