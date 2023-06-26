import "./PlayerList.css";

type Props = {
  o: string;
  x: string;
  current?: "o" | "x";
}

const PlayerList = ({
  o,
  x,
  current
}: Props) => {
  return (
    <div className="players">
      <div className={current === "o" ? "current" : undefined}>
        O = {o}
      </div>
      <div className={current === "x" ? "current" : undefined}>
        X = {x}
      </div>
    </div>
  );
}

export default PlayerList;