import { useState } from 'react';
import { useGameContext } from '../context/GameContext';
import "./GameSetup.css";
import { useAuth } from '../context/AuthContext';

const GameSetup = () => {
  const [isJoining, setIsJoining] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  const { user } = useAuth();

  const {
    createGame,
    pairingCode,
    joinGame,
    isLoading
  } = useGameContext();

  return (
    <div className="setup">
      <div className="user">
        <div>
          Welcome <b>{user?.email}</b>
        </div>
        <a href="/api/auth/logout">
          Log out
        </a>
      </div>
      {pairingCode.length > 0 ? (
        <div className="code">
          <div>Share Pairing Code:</div>
          <h2>{pairingCode}</h2>
          <div>Waiting for Player 2 to join...</div>
          <a onClick={() => window.location.reload()}>Cancel</a>
        </div>
      ) : isJoining ? (
        <div className="config">
          <input
            id="join"
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            value={joinCode}
          />
          <button
            onClick={async () => await joinGame(joinCode)}
            disabled={isLoading}
          >
            Pair
          </button>
          <a onClick={() => setIsJoining(false)}>
            Cancel
          </a>
        </div>
      ) : (
        <div className="config">
          <button
            onClick={async () => await createGame()}
            disabled={isLoading}
          >
            New Game
          </button>
          or
          <button onClick={() => setIsJoining(true)}>
            Join Game
          </button>
        </div>
      )}
    </div>
  );
}

export default GameSetup;