import { useEffect, useState } from "react";
import "./Leaderboard.css";

type Rank = { winner: string, wins: number };

const Leaderboard = () => {
  const [leaders, setLeaders] = useState<Rank[]>();

  useEffect(() => {
    async function getLeaders() {
      const resp = await fetch('api/leaderboard');
      if (resp.ok) {
        const data = await resp.json() as Rank[];
        setLeaders(data);
      }
    }
    getLeaders();
  }, []);

  return (
    <div className="leaderboard">
      <h2>Leaderboard</h2>
      <ol>
        {leaders?.map(rank => (
          <li key={rank.winner}>
            <div>
              <div>{rank.winner}</div>
              <div>{rank.wins} wins</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default Leaderboard;