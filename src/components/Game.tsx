import { useMemo } from 'react';
//import { useAuth } from '../context/AuthContext';
import { useGameContext } from '../context/GameContext';
import Board from './Board';
import PlayerList from './PlayerList';
import GameResult, { GameResultType } from './GameResult';

const Game = () => {
  //const { user } = useAuth();
  const { game, handleMove } = useGameContext();

  const result: GameResultType | undefined = useMemo(() => {
    if (game?.is_draw) return { type: "draw" };
    if (game?.winner) return { type: "win", winner: game.winner };
    return undefined;
  }, [game?.is_draw, game?.winner])

  return game && 
    //user?.email &&
  (
    <>
      <PlayerList
        o={game.player0}
        x={game.player1}
        //user={user.email}
        current={game.current_turn === 0 ? "o" : game.current_turn === 1 ? "x" : undefined}
      />
      <GameResult result={result} />
      <Board
        board={game.board}
        handleClickSquare={handleMove}
      />
    </>
  );
}

export default Game;