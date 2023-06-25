type Props = {
  o: string;
  x: string;
  //user: string;
  current?: "o" | "x";
}

const PlayerList = ({
  o,
  x,
  //user,
  current
}: Props) => {
  return (
    <div>
      <div className={current === "o" ? "current" : undefined}>
        O: {o}
      </div>
      <div className={current === "x" ? "current" : undefined}>
        X: {x}
      </div>
    </div>
  );
}

export default PlayerList;