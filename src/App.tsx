import { useState } from 'react'
import './App.css'
import Board from './components/Board'
import { GameContextProvider, useGameContext } from './context/GameContext'

const Game = () => {
  const [joinCode, setJoinCode] = useState("");

  const {
    createGame,
    pairingCode,
    game,
    joinGame,
    handleMove,
    error,
    username,
    setUsername
  } = useGameContext();

  return (
    <>
      <h1>Tic Tac Toe</h1>
      <h2 style={{ color: "red" }}>{error}</h2>
      {pairingCode.length > 0 && (
        <>
        <div>Share Pairing Code with player 2:</div>
        <h2>{pairingCode}</h2>
        </>
      )}
      {!game ? (
        <>
          <div style={{ padding: 16 }}>
            Name:
            <input
              onChange={(e) => setUsername(e.target.value)}
              value={username}
            />
          </div>
          <hr />
          <button
            onClick={async () => await createGame()}
            disabled={username.length < 3}
          >
            New Game
          </button>
          <div>
            Pairing Code:
            <input
              onChange={(e) => setJoinCode(e.target.value)}
              value={joinCode}
            />
            <button
              onClick={async () => await joinGame(joinCode)}
              disabled={username.length < 3 || joinCode.length < 3}
            >
              Join Game
            </button>
          </div>
        </>
      ) : (
        <>
          <Board
            board={game.board}
            handleClickSquare={handleMove}
          />
        </>
      )}
    </>
  )
}

const App = () => {

  return (
    <GameContextProvider>
      <Game />
    </GameContextProvider>
  )
}

export default App
