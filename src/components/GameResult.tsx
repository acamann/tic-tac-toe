import Leaderboard from "./Leaderboard";

type Props = {
  result?: {
    type: "draw"
  } | {
    type: "win",
    winner: string
  };
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