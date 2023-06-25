//import { useAuth } from '../context/AuthContext';
import { useGameContext } from '../context/GameContext';
import Board from './Board';

const Game = () => {
  //const { user } = useAuth();
  const { game, handleMove } = useGameContext();

  return game && (
    <>
      <div>
        <div>
          O: {game.player0} {game.current_turn === 0 && "<"}
          {game.winner === 0 && "- WINNER!"}
        </div>
        <div>
          X: {game.player1} {game.current_turn === 1 && "<"}
          {game.winner === 1 && "- WINNER!"}
        </div>
      </div>
      <Board
        board={game.board}
        handleClickSquare={handleMove}
      />
    </>
  );
}

export default Game;