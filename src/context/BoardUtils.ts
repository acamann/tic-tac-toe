import { GameBoard, Move } from "../types/models";

export const initialBoardState: GameBoard = [
  [null, null, null],
  [null, null, null],
  [null, null, null],
];

export const getWinner = (board: GameBoard): 0 | 1 | null => {
  for (const player of [0, 1]) {
    for (let i = 0; i < 3; i++) {
      if (board[i].every(value => value === player)) return player as 0 | 1; // 3 in row
      if (board.every(row => row[i] === player)) return player as 0 | 1; // 3 in col
    }
    if (board[0][0] === player && board[1][1] === player && board[2][2] === player) return player; // diagonal L to R
    if (board[2][0] === player && board[1][1] === player && board[0][2] === player) return player; // diagonal R to L
  }
  return null;
}

export const isDraw = (board: GameBoard): boolean => {
  return board.every(row => row.every(square => square !== null));
}

export const isValidMove = (board: GameBoard, move: Move): boolean => {
  if (board[move.rowIndex][move.colIndex] !== null) {
    return false; // spot's taken
  }
  return true;
}

export const getNewBoard = (board: GameBoard, move: Move): GameBoard => {
  if (!isValidMove(board, move)) {
    throw new Error("Invalid move");
  }
  return board.map((row, i) => {
    if (i !== move.rowIndex) return row;
    return row.map((square, j) => {
      if (j !== move.colIndex) return square;
      return move.player;
    })
  }) as GameBoard;
}