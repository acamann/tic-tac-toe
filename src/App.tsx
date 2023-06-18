import './App.css'
import { GameBoard } from './types/models'
import Board from './components/Board'
import { useState } from 'react'

const initialState: GameBoard = [
  [undefined, undefined, undefined],
  [undefined, undefined, undefined],
  [undefined, undefined, undefined],
]

const App = () => {
  const [board, setBoard] = useState(initialState);
  const [isXTurn, setIsXTurn] = useState(false);

  const handleClickSquare = (rowIndex: 0 | 1 | 2, colIndex: 0 | 1 | 2) => {
    setBoard(existing => {
      return existing.map((row, i) => {
        if (i !== rowIndex) return row;
        else {
          return row.map((square, j) => {
            if (j !== colIndex) return square;
            else {
              return isXTurn ? "X" : "O";
            }
          });
        }
      }) as GameBoard;
    });
    setIsXTurn(existingValue => !existingValue);
  }

  return (
    <>
      <h1>Tic Tac Toe</h1>
      <Board
        board={board}
        handleClickSquare={handleClickSquare}
      />
    </>
  )
}

export default App
