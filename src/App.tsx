import './App.css'
import { GameContextProvider, useGameContext } from './context/GameContext'
import AuthProvider, { useAuth } from './context/AuthContext'
import Authenticate from './components/Authenticate'
import GameSetup from './components/GameSetup'
import Game from './components/Game'
import DBProvider from './context/DBContext'

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
      <AuthProvider>
        <GameContextProvider>
          <App />
        </GameContextProvider>
      </AuthProvider>
    </DBProvider>
  )
}

export default AppWrapper
