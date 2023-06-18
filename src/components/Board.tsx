import { GameBoard } from "../types/models";
import Square from "./Square";
import './Board.css'

type Props = {
  board: GameBoard;
  handleClickSquare: (rowIndex: 0 | 1 | 2, colIndex: 0 | 1 | 2) => void;
}

const Board = ({
  board,
  handleClickSquare
}: Props) => {
  return (
    <div className="board">
      {board.map((row, rowIndex) => (
        <div className="row">
          {row.map((squareValue, colIndex) => (
            <Square
              value={squareValue}
              onClick={(): void => handleClickSquare(rowIndex as 0 | 1 | 2, colIndex as 0 | 1 | 2)}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export default Board;
