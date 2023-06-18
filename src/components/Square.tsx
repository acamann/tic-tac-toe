import { SquareValue } from "../types/models";
import './Square.css'

type Props = {
  value: SquareValue;
  onClick: () => void;
}

const Square = ({
  value,
  onClick
}: Props) => {

  return (
    <button
      className="square"
      onClick={onClick}
      disabled={value !== undefined}
    >
      {value}
    </button>
  )
}

export default Square
