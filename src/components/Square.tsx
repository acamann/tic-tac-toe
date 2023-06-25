import { SquareValue } from "../types/models";
import './Square.css'

type Props = {
  value: SquareValue;
  disabled: boolean;
  onClick: () => void;
}

const Square = ({
  value,
  disabled,
  onClick
}: Props) => {
  return (
    <button
      className="square"
      onClick={onClick}
      disabled={disabled || value !== null}
    >
      {value === 0 ? "O" : value === 1 ? "X" : undefined}
    </button>
  )
}

export default Square
