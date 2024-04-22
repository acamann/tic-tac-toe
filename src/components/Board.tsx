import { GameBoard } from "../types/models";
import Square from "./Square";
import { useGameContext } from "../context/GameContext";
import styled from "styled-components";
import { useMemo } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";

type Props = {
  board: GameBoard;
  handleClickSquare: (rowIndex: 0 | 1 | 2, colIndex: 0 | 1 | 2) => void;
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  border-bottom: solid 1px darkgray;

  &:last-of-type {
    border-bottom: none;
  }

  > * {
    width: 200px;
    height: 200px;
    font-size: 10em;
    line-height: normal;
    border-right: solid 1px darkgray;

    &:last-of-type {
      border-right: none;
    }

    @media (max-width: 480px) {
      width: 100px;
      height: 100px;
      font-size: 5em;
    }
  }
`;

const Board = ({ board, handleClickSquare }: Props) => {
  const { game } = useGameContext();

  const { user } = useUser();

  const isCurrentTurn = useMemo(() => {
    if (!game) return false;
    if (game.current_turn === 0) {
      return game.player0 === user?.nickname ?? user?.name;
    } else if (game.current_turn === 1) {
      return game.player1 === user?.nickname ?? user?.name;
    }
  }, [game, user]);

  return (
    game && (
      <Container>
        {board.map((row, rowIndex) => (
          <Row key={rowIndex}>
            {row.map((squareValue, colIndex) => (
              <Square
                key={`${rowIndex}-${colIndex}`}
                value={squareValue}
                disabled={
                  !isCurrentTurn || game.is_draw || game.winner !== null
                }
                onClick={(): void =>
                  handleClickSquare(
                    rowIndex as 0 | 1 | 2,
                    colIndex as 0 | 1 | 2,
                  )
                }
              />
            ))}
          </Row>
        ))}
      </Container>
    )
  );
};

export default Board;
