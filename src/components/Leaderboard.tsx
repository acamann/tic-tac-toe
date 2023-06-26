import { useEffect, useState } from "react";
import "./Leaderboard.css";
import { useDB } from "../context/DBContext";

type Rank = { winner: string, wins: number };

const Leaderboard = () => {
  const [leaders, setLeaders] = useState<Rank[]>();

  const { supabase } = useDB();

  useEffect(() => {
    supabase
      .from('leaderboard')
      .select("winner, wins")
      .then(({ data }) => {
        if (data) {
          setLeaders(data);
        }
      });
  }, [supabase]);

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