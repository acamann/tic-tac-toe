import { useEffect, useMemo } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useGameContext } from "../context/GameContext";
import styled from "styled-components";
import {
  useCreateRoomMutation,
  useGetRoomsQuery,
  useJoinRoomMutation,
  useLeaveRoomMutation,
} from "../services/rooms";
import Ably from "ably";

const User = styled.div`
  margin: 24px 0;
`;

const Link = styled.a`
  cursor: pointer;
`;

const Lobby = () => {
  const { data: rooms = [], isLoading } = useGetRoomsQuery();
  const [createRoom] = useCreateRoomMutation();
  const [joinRoom] = useJoinRoomMutation();
  const [leaveRoom] = useLeaveRoomMutation();

  const { user } = useUser();
  const userName = useMemo(() => user?.nickname ?? user?.name, [user]);

  const { startGame, joinGame } = useGameContext();

  // TODO use RTK for "my room" state
  const myRoomId = useMemo(
    () =>
      userName
        ? rooms.find((r) => r.players.includes(userName))?.id
        : undefined,
    [rooms, userName],
  );

  // TODO: still need to move this last bit to RTK Query
  useEffect(() => {
    if (myRoomId) {
      const realtimeClient = new Ably.Realtime({
        authUrl: "/api/realtime/token",
      });
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
          realtimeClient.close();
        }
      };
    }
  }, [myRoomId]);

  if (!userName) {
    return null;
  }

  return (
    <div>
      <User>
        <div>
          Welcome <b>{user?.nickname ?? user?.name}</b>
        </div>
        <Link href="/api/auth/logout">Log out</Link>
      </User>
      {!myRoomId && <button onClick={() => createRoom()}>New Game</button>}
      <h2>Games</h2>
      {isLoading && <div>"Loading..."</div>}
      <ul>
        {/* TODO: clean up all the conditionals here */}
        {rooms.map((room) => (
          <li key={room.id}>
            <b>{room.host === userName ? "You" : room.host}</b> vs.
            {room.players.length === 2 ? (
              <>{room.players.filter((player) => player !== room.host)}</>
            ) : (
              <i> (awaiting opponent...)</i>
            )}
            {!myRoomId && room.players.length < 2 && (
              <a onClick={() => joinRoom(room.id)} style={{ marginLeft: 8 }}>
                Join
              </a>
            )}
            {room.id === myRoomId && (
              <a onClick={() => leaveRoom(room.id)} style={{ marginLeft: 8 }}>
                Leave
              </a>
            )}
            {room.players.length === 2 && room.host === userName && (
              <button
                onClick={() => startGame(room.id)}
                style={{ marginLeft: 8 }}
              >
                Start Game
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Lobby;
