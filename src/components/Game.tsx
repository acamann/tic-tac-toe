import { useMemo } from 'react';
//import { useAuth } from '../context/AuthContext';
import { useGameContext } from '../context/GameContext';
import Board from './Board';
import PlayerList from './PlayerList';
import GameResult from './GameResult';

const Game = () => {
  //const { user } = useAuth();
  const { game, handleMove } = useGameContext();

  // TODO: draw
  const result: { type: "win", winner: string } | undefined = useMemo(() => {
    if (game?.winner === undefined) return undefined;
    if (game?.winner === 0) return { type: "win", winner: game.player0 };
    if (game?.winner === 1) return { type: "win", winner: game.player1 };
  }, [game?.winner, game?.player0, game?.player1])

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