import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { createClient } from '@supabase/supabase-js';
import { GameEntity, RoomEntity } from '../../../types/models';
import { initialBoardState } from '../../../utils/BoardUtils';
import Ably from "ably";

if (!process.env.SUPABASE_URL) {
  throw new Error("Missing required environment variable SUPABASE_URL");
}
if (!process.env.SUPABASE_KEY) {
  throw new Error("Missing required environment variable SUPABASE_KEY");
}

// Supabase DB - for persisted game state
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

if (!process.env.ABLY_API_KEY) {
  throw new Error("Missing ABLY_API_KEY");
}

const realtime = new Ably.Realtime({ key: process.env.ABLY_API_KEY });

export default withApiAuthRequired(async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    if (request.method === "GET") {
      const {
        data,
        error
      } = await supabase.from('Games')
        .select()
        .returns<GameEntity[]>();

      if (error) {
        return response.status(409).json({ message: error.message });
      }

      return response.status(200).json({ games: data });
    } else if (request.method === "PUT") {
      const session = await getSession(request, response);
      if (!session) {
        return response.status(401);
      }

      // create game from room (in body of request)
      console.log(request.body);
      const { room_id } = JSON.parse(request.body);

      if (!room_id) {
        return response.status(400).json({ message: "room_id is required in body" });
      }
      const playerName = session.user.nickname ?? session.user.name;

      // is it a known room, which the requestor is the host?
      const { data: roomData, error: roomError } = await supabase
        .from('Rooms')
        .select()
        .eq("id", room_id)
        .returns<RoomEntity[]>();

      if (!roomData || roomData.length === 0) {
        return response.status(409).json({ message: roomError?.message ?? "Room not found" });
      }

      const room = roomData[0];

      if (playerName !== room.host) {
        return response.status(403).json({ message: "Game can only be started by host" });
      }

      if (room.players.length !== 2) {
        return response.status(409).json({ message: "Game is not ready to start, 2 players are required" });
      }

      const player0 = room.host;
      const player1 = room.players.filter(player => player !== player0)[0];

      // TODO: is there already a game in progress in this room?

      // create a new game (associated with the room)
      // store game
      const {
        data: gameDataResult,
        error: createGameError
      } = await supabase.from('Games')
        .insert({
          player0,
          player1,
          board: initialBoardState,
          current_turn: 0
        })
        .select()
        .returns<GameEntity[]>();

      if (createGameError) {
        return response.status(409).json({ message: createGameError.message });
      }

      const game = gameDataResult[0];

      // pub update to realtime room channel
      const channel = realtime.channels.get(room_id);
      channel.publish("start", JSON.stringify({ gameId: game.game_id }));
      channel.detach();

      return response.status(200).json(game);
    } else {
      return response.status(405);
    }
  } catch (e) {
    return response.status(500).json({ message: "An unknown error occurred" });
  }
});