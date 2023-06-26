import Leaderboard from "./Leaderboard";
import "./GameResult.css";

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
    <div className="result">
      <h2>
        {result.type === "win" ? (
          `${result.winner} won!`
        ) : (
          "It's a tie."
        )}
      </h2>
      <Leaderboard />
      <button onClick={() => window.location.reload()}>Play again</button>
    </div>
  );
}

export default GameResult;