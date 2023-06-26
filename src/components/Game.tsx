import { useMemo } from 'react';
import { useGameContext } from '../context/GameContext';
import Board from './Board';
import PlayerList from './PlayerList';
import GameResult, { GameResultType } from './GameResult';

const Game = () => {
  const { game, handleMove } = useGameContext();

  const result: GameResultType | undefined = useMemo(() => {
    if (game?.is_draw) return { type: "draw" };
    if (game?.winner) return { type: "win", winner: game.winner };
    return undefined;
  }, [game?.is_draw, game?.winner])

  return game && (
    <>
      {result ? (
        <GameResult result={result} />
      ) : (
        <PlayerList
          o={game.player0}
          x={game.player1}
          current={game.current_turn === 0 ? "o" : game.current_turn === 1 ? "x" : undefined}
        />
      )}
      <Board
        board={game.board}
        handleClickSquare={handleMove}
      />
    </>
  );
}

export default Game;