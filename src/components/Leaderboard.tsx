import { useEffect, useState } from "react";
import supabaseClient from "../database/supabaseClient";
import "./Leaderboard.css";

type Rank = { winner: string, wins: number };

const Leaderboard = () => {
  const [leaders, setLeaders] = useState<Rank[]>();

  useEffect(() => {
    supabaseClient
      .from('leaderboard')
      .select("winner, wins")
      .then(({ data }) => {
        if (data) {
          setLeaders(data);
        }
      });
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