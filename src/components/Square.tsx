import { SquareValue } from "../types/models";

type Props = {
  value: SquareValue;
}

const Square = ({
  value
}: Props) => {

  return (
    <a href="#">
      {value}
    </a>
  )
}

export default Square
