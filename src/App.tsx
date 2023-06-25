import { useState } from 'react'
import './App.css'
import Board from './components/Board'
import { GameContextProvider, useGameContext } from './context/GameContext'
import AuthProvider, { useAuth } from './context/AuthContext'
import Register from './components/Register'
import Login from './components/Login'

const Game = () => {
  const [isRegistering, setIsRegistering] = useState(true);
  const { user } = useAuth();

  const [joinCode, setJoinCode] = useState("");

  const {
    createGame,
    pairingCode,
    game,
    joinGame,
    handleMove,
    error,
  } = useGameContext();

  return (
    <>
      <h1>Tic Tac Toe</h1>
      { !user ?
        isRegistering ? (
          <>
            <Register />
            <div>
              Already a User? <a onClick={() => setIsRegistering(false)}>Login</a>
            </div>
          </>
        ) : (
          <>
            <Login />
            <div>
              No Account? <a onClick={() => setIsRegistering(true)}>Register</a>
            </div>
          </>
      ) : (
        <>
          <h2 style={{ color: "red" }}>{error}</h2>
          <div style={{ padding: 16 }}>
            Welcome <b>{user.email}</b>
          </div>
          {pairingCode.length > 0 ? (
            <>
              <div>Share Pairing Code with player 2:</div>
              <h2>{pairingCode}</h2>
            </>
          ) : !game ? (
            <>
              <hr />
              <button
                onClick={async () => await createGame()}
              >
                New Game
              </button>
              <div>
                Pairing Code:
                <input
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  value={joinCode}
                />
                <button
                  onClick={() => joinGame(joinCode)}
                >
                  Join Game
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                <div>
                  O: {game.player0} {game.current_turn === 0 && "<"}
                  {game.winner === 0 && "- WINNER!"}
                </div>
                <div>
                  X: {game.player1} {game.current_turn === 1 && "<"}
                  {game.winner === 1 && "- WINNER!"}
                </div>
              </div>
              <Board
                board={game.board}
                handleClickSquare={handleMove}
              />
            </>
          )}
        </>
      )}
    </>
  )
}

const App = () => {

  return (
    <AuthProvider>
      <GameContextProvider>
        <Game />
      </GameContextProvider>
    </AuthProvider>
  )
}

export default App
