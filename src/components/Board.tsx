import { GameBoard } from "../types/models";
import Square from "./Square";
import './Board.css'
import { useGameContext } from "../context/GameContext";

type Props = {
  board: GameBoard;
  handleClickSquare: (rowIndex: 0 | 1 | 2, colIndex: 0 | 1 | 2) => void;
}

const Board = ({
  board,
  handleClickSquare
}: Props) => {
  const { game } = useGameContext();
  return game && (
    <div className="board">
      {board.map((row, rowIndex) => (
        <div className="row" key={rowIndex}>
          {row.map((squareValue, colIndex) => (
            <Square
              key={`${rowIndex}-${colIndex}`}
              value={squareValue}
              disabled={game.current_turn !== game.self || game.is_draw || game.winner !== null}
              onClick={(): void => handleClickSquare(rowIndex as 0 | 1 | 2, colIndex as 0 | 1 | 2)}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export default Board;
