import { GameBoard } from "../types/models";
import Square from "./Square";
import './Board.css'

type Props = {
  board: GameBoard;
}

const Board = ({
  board
}: Props) => {
  return (
    <div className="board">
      {board.map((row, rowIndex) => (
        <div className="row">
          {row.map((squareValue, colIndex) => (
            <Square value={squareValue} />
          ))}
        </div>
      ))}
    </div>
  )
}

export default Board;
