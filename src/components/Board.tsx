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
      {board.map((row) => (
        <div className="row">
          {row.map((squareValue) => (
            <Square value={squareValue} />
          ))}
        </div>
      ))}
    </div>
  )
}

export default Board;
