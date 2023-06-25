import Leaderboard from "./Leaderboard";

export type GameResultType = {
  type: "draw"
} | {
  type: "win",
  winner: string
};

type Props = {
  result?: GameResultType;
}

const GameResult = ({
  result
}: Props) => {
  return result && (
    <div>
      <h2>
        Game Over.
        {result.type === "win" ? (
          `${result.winner} Wins!`
        ) : (
          "It's a tie..."
        )}
      </h2>
      <Leaderboard />
      <a onClick={() => window.location.reload()}>Play again?</a>
    </div>
  );
}

export default GameResult;