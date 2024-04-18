import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js';
import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { RoomEntity } from '../../../types/models';
import Ably from 'ably';

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
    const session = await getSession(request, response);
    if (!session) {
      return response.status(401);
    }

    if (request.method === "GET") {
      const { data = [] } = await supabase
        .from('Rooms')
        .select()
        .returns<RoomEntity[]>();

      return response.status(200).json({ rooms: data });
    } else if (request.method === "POST") {
      const player = session.user.nickname ?? session.user.name;

      // already in a room?
      const { data: currentRoomData, error: currentRoomError } = await supabase
        .from('Rooms')
        .select()
        .filter('players', 'cs', `{${player}}`)
        .returns<RoomEntity[]>();

      if (currentRoomError) {
        return response.status(500).json(currentRoomError)
      }

      if (!currentRoomData || currentRoomData.length > 0) {
        return response.status(409).json({ message: "Already in a room", id: currentRoomData[0].id })
      }

      const room = {
        host: player,
        players: [player],
      }

      // store room
      const {
        data,
        error
      } = await supabase.from('Rooms')
        .insert(room)
        .select()
        .returns<RoomEntity[]>();

      if (error || data.length === 0) {
        return response.status(409).json({ message: error?.message ?? "No data in result of insert" });
      }

      const roomData = data[0];

      // pub new room to realtime lobby channel
      const channel = realtime.channels.get("Lobby");
      channel.publish("create", JSON.stringify(roomData));
      channel.detach();
      realtime.close();

      return response.status(200).json(roomData);
    } else {
      return response.status(405);
    }
  } catch (e) {
    return response.status(500).json({ message: "An unknown error occurred" });
  }
});