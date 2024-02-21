import { useEffect, useState } from 'react';
import "./GameSetup.css";
import { useUser } from "@auth0/nextjs-auth0/client";
import { RoomEntity } from '../types/models';
import { useAblyRealtime } from '../context/AblyRealtimeContext';

const RoomTest = () => {
  const [rooms, setRooms] = useState<RoomEntity[]>([]);

  const { user } = useUser();

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

  useEffect(() => {
    getRooms();
  }, []);

  const { client: realtimeClient } = useAblyRealtime();

  useEffect(() => {
    const channel = realtimeClient.channels.get("Lobby");
    channel.subscribe((message) => {
      if (message.name === "rooms") {
        const rooms = JSON.parse(message.data) as RoomEntity[];
        setRooms(rooms);
      }
    });

    return () => {
      if (channel) {
        channel.unsubscribe();
        channel.detach(); // need to detach to release channel, unsubscribe doesn't cut it
      }
    }
  }, [realtimeClient.channels]);

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
      <button onClick={createRoom}>Create Room</button>
      <ul>
        {rooms.map(room => (
          <li key={room.id}>{room.host} ({room.players.length})</li>
        ))}
      </ul>
    </div>
  );
}

export default RoomTest;