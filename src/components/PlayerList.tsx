import styled, { css } from "styled-components";

type Props = {
  o: string;
  x: string;
  current?: "o" | "x";
}

const Players = styled.div`
  display: flex;
  flex-direction: column;
  margin: 24px;
  gap: 8px;
  align-items: center;
`;

const Player = styled.div<{ $isCurrentTurn: boolean; }>`
  padding: 8px;
  border-radius: 8px;
  ${props => props.$isCurrentTurn && css`
    font-weight: bold;
    background-color: lightsteelblue;
  `}
`;

const PlayerList = ({
  o,
  x,
  current
}: Props) => {
  return (
    <Players>
      <Player $isCurrentTurn={current === "o"}>
        O = {o}
      </Player>
      <Player $isCurrentTurn={current === "x"}>
        X = {x}
      </Player>
    </Players>
  );
}

export default PlayerList;