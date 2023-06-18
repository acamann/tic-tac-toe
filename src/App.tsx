import './App.css'
import { GameBoard } from './types/models'
import Board from './components/Board'

const App = () => {
  const board: GameBoard = [
    [undefined, undefined, undefined],
    [undefined, undefined, undefined],
    [undefined, undefined, undefined],
  ]

  return (
    <>
      <h1>Tic Tac Toe</h1>
      <Board board={board} />
    </>
  )
}

export default App
