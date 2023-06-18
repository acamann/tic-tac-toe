import './App.css'
import Board from './components/Board'
import { GameContextProvider, useGameContext } from './context/GameContext'

const Game = () => {
  const { createGame, game, handleMove, error } = useGameContext();
  return (
    <>
      <h1>Tic Tac Toe</h1>
      <button onClick={async (): Promise<void> => {
        await createGame();
      }}>
        New Game
      </button>
      <h2 style={{ color: "red" }}>{error}</h2>
      {game && (
        <>
          <h2>Pairing Code: {game.pairingCode}</h2>
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
