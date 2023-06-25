import './App.css'
import { GameContextProvider, useGameContext } from './context/GameContext'
import AuthProvider, { useAuth } from './context/AuthContext'
import Authenticate from './components/Authenticate'
import GameSetup from './components/GameSetup'

const App = () => {
  const { user } = useAuth();
  const { game } = useGameContext();

  return (
    <>
      <h1>Tic Tac Toe</h1>
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
    <AuthProvider>
      <GameContextProvider>
        <App />
      </GameContextProvider>
    </AuthProvider>
  )
}

export default AppWrapper
