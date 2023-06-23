export type SquareValue = 0 | 1 | null;

export type GameBoard = [
  [SquareValue, SquareValue, SquareValue],
  [SquareValue, SquareValue, SquareValue],
  [SquareValue, SquareValue, SquareValue]
];

export type Move = {
  player: 0 | 1;
  rowIndex: 0 | 1 | 2;
  colIndex: 0 | 1 | 2;
}