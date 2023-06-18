export type SquareValue = "X" | "O" | undefined;

export type GameBoard = [
  [SquareValue, SquareValue, SquareValue],
  [SquareValue, SquareValue, SquareValue],
  [SquareValue, SquareValue, SquareValue]
];