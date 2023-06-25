import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGameContext } from '../context/GameContext';

const GameSetup = () => {
  const [joinCode, setJoinCode] = useState("");

  const { user } = useAuth();

  const {
    createGame,
    pairingCode,
    joinGame,
    error,
  } = useGameContext();

  return (
    <>
      <h2 style={{ color: "red" }}>{error}</h2>
      <div style={{ padding: 16 }}>
        Welcome <b>{user?.email}</b>
      </div>
      {pairingCode.length > 0 && (
        <>
          <div>Share Pairing Code with player 2:</div>
          <h2>{pairingCode}</h2>
        </>
      )}
      <button
        onClick={async () => await createGame()}
      >
        New Game
      </button>
      <div>
        Pairing Code:
        <input
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          value={joinCode}
        />
        <button
          onClick={() => joinGame(joinCode)}
        >
          Join Game
        </button>
      </div>
    </>
  );
}

export default GameSetup;