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

export type GameEntity = {
  game_id: string;
  board: GameBoard;
  player0: string;
  player1: string;
  current_turn: boolean | null;
  winner: string | null;
  is_draw: boolean | null;
}

export type RoomEntity = {
  id: string;
  host: string;
  players: string[];
  created: Date;
  last_touched: Date;
}