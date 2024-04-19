import styled from "styled-components";
import { SquareValue } from "../types/models";

type Props = {
  value: SquareValue;
  disabled: boolean;
  onClick: () => void;
}

const SquareButton = styled.button`
  line-height: normal;
  display: flex;
  align-items: center;
  justify-content: center;
  border: unset;
  border-radius: unset;
  padding: unset;
  background-color: unset;

  &:disabled {
    cursor: default;
    color: unset;
  }
`

const Square = ({
  value,
  disabled,
  onClick
}: Props) => {
  return (
    <SquareButton
      className="square"
      onClick={onClick}
      disabled={disabled || value !== null}
    >
      {value === 0 ? "O" : value === 1 ? "X" : undefined}
    </SquareButton>
  )
}

export default Square
