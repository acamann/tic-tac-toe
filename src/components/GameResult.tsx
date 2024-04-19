import Leaderboard from "./Leaderboard";
import styled from "styled-components";

export type GameResultType = {
  type: "draw"
} | {
  type: "win",
  winner: string
};

type Props = {
  result?: GameResultType;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`

const ResultHeader = styled.h2`
  margin: 0;
`

const GameResult = ({
  result
}: Props) => {
  return result && (
    <Container>
      <ResultHeader>
        {result.type === "win" ? (
          `${result.winner} won!`
        ) : (
          "It's a tie."
        )}
      </ResultHeader>
      <Leaderboard />
      <button onClick={() => window.location.reload()}>Play again</button>
    </Container>
  );
}

export default GameResult;