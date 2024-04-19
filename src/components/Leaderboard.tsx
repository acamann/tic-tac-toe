import { useEffect, useState } from "react";
import styled from "styled-components";

type Rank = { winner: string, wins: number };

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: lightgray;
  border-radius: 16px;
  padding: 16px;
`;

const Header = styled.h2`
  margin: 0;
  font-size: 1.1em;
`

const Leaders = styled.ol`
  li div {
    display: flex;

    :first-child {
      width: 250px;
      text-align: left;
    }
  }
`

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
    <Container>
      <Header>Leaderboard</Header>
      <Leaders>
        {leaders?.map(rank => (
          <li key={rank.winner}>
            <div>
              <div>{rank.winner}</div>
              <div>{rank.wins} wins</div>
            </div>
          </li>
        ))}
      </Leaders>
    </Container>
  );
}

export default Leaderboard;