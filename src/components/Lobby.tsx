import { useEffect, useMemo, useState } from 'react';
import "./GameSetup.css";
import { useUser } from "@auth0/nextjs-auth0/client";
import { RoomEntity } from '../types/models';
import { useAblyRealtime } from '../context/AblyRealtimeContext';
import { useGameContext } from '../context/GameContext';

const Lobby = () => {
  const [rooms, setRooms] = useState<RoomEntity[]>([]);

  const { user } = useUser();
  const userName = useMemo(() => user?.nickname ?? user?.name, [user]);

  useEffect(() => {
    getRooms();
  }, []);

  const { client: realtimeClient } = useAblyRealtime();

  const { startGame, joinGame } = useGameContext();

  const myRoomId = useMemo(() => 
    userName
      ? rooms.find(r => r.players.includes(userName))?.id
      : undefined
    , [rooms, userName]);

  useEffect(() => {
    const channel = realtimeClient.channels.get("Lobby");
    channel.subscribe((message) => {
      if (message.name === "create") {
        const room = JSON.parse(message.data) as RoomEntity;
        setRooms(current => [...current, room]);
      } else if (message.name === "update") {
        const room = JSON.parse(message.data) as RoomEntity;
        setRooms(current => current.map(currentRoom => currentRoom.id === room.id ? room : currentRoom));
      } else if (message.name === "delete") {
        const room = JSON.parse(message.data) as RoomEntity;
        setRooms(current => current.filter(currentRoom => currentRoom.id !== room.id));
      }
    });

    return () => {
      if (channel) {
        channel.unsubscribe();
        channel.detach(); // need to detach to release channel, unsubscribe doesn't cut it
      }
    }
  }, [realtimeClient.channels]);

  useEffect(() => {
    if (myRoomId) {
      const channel = realtimeClient.channels.get(myRoomId);
      channel.subscribe((message) => {
        if (message.name === "start") {
          const { gameId } = JSON.parse(message.data) as { gameId: string };
          joinGame(gameId);
        }
      });

      return () => {
        if (channel) {
          channel.unsubscribe();
          channel.detach(); // need to detach to release channel, unsubscribe doesn't cut it
        }
      }
    }
  }, [realtimeClient.channels, myRoomId]);

  if (!userName) { 
    return null;
  }

  // TODO: RTK Query all of these

  const createRoom = async () => {
    const resp = await fetch(`/api/rooms`, {
      method: "POST"
    });
    if (!resp.ok) {
      console.error(resp);
    }
  };

  const getRooms = async () => {
    const resp = await fetch(`/api/rooms`);
    if (!resp.ok) {
      console.error(resp);
      return;
    }

    const { rooms } = await resp.json() as { rooms: RoomEntity[] };
    setRooms(rooms);
  }

  const joinRoom = async (id: string) => {
    const resp = await fetch(`/api/rooms/${id}`, {
      method: "PUT"
    });
    if (!resp.ok) {
      console.error(resp);
    }
  };

  const leaveRoom = async (id: string) => {
    const resp = await fetch(`/api/rooms/${id}`, {
      method: "DELETE"
    });
    if (!resp.ok) {
      console.error(resp);
    }
  };

  return (
    <div className="setup">
      <div className="user">
        <div>
          Welcome <b>{user?.nickname ?? user?.name}</b>
        </div>
        <a href="/api/auth/logout">
          Log out
        </a>
      </div>
      <button onClick={createRoom}>New Game</button>
      <h2>Games</h2>
      <ul>
        {/* TODO: clean up all the conditionals here */}
        {rooms.map(room => (
          <li key={room.id}>
            <b>{room.host === userName ? "You" : room.host}</b> vs.
            {room.players.length === 2 ? (
              <> {room.players.filter(player => player !== room.host)}</>
            ) : (
              <i> (awaiting opponent...)</i>
            )}
            {room.players.length < 2 && !room.players.includes(userName) && (
              <a onClick={() => joinRoom(room.id)} style={{ marginLeft: 8 }}>
                Join
              </a>
            )}
            {room.players.includes(userName) && (
              <a onClick={() => leaveRoom(room.id)} style={{ marginLeft: 8 }}>
                Leave
              </a>
            )}
            {room.players.length === 2 && room.host === userName && (
              <button onClick={() => startGame(room.id)} style={{ marginLeft: 8 }}>Start Game</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Lobby;