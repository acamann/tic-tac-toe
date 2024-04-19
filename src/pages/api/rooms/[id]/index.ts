import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { RoomEntity } from "./../../../../types/models";
import Ably from "ably";

const ROOM_MAX = 2;

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
  response: NextApiResponse,
) {
  try {
    const { id } = request.query;
    const session = await getSession(request, response);

    if (!session) {
      return response.status(401);
    }

    if (request.method === "GET") {
      const { data, error } = await supabase
        .from("Rooms")
        .select()
        .eq("id", id)
        .returns<RoomEntity[]>();

      if (!data || data.length === 0) {
        return response
          .status(404)
          .json({ message: error?.message ?? "Room not found" });
      }

      const room = data[0];

      return response.status(200).json(room);
    } else if (request.method === "PUT") {
      // TODO: switch to using user id
      const player: string = session.user.nickname ?? session.user.name;

      const { data: currentRoomData, error: currentRoomError } = await supabase
        .from("Rooms")
        .select()
        .filter("players", "cs", `{${player}}`)
        .returns<RoomEntity[]>();

      if (currentRoomError) {
        return response.status(500).json(currentRoomError);
      }

      if (!currentRoomData || currentRoomData.length > 0) {
        return response
          .status(409)
          .json({ message: "Already in a room", id: currentRoomData[0].id });
      }

      const { data, error: findRoomError } = await supabase
        .from("Rooms")
        .select()
        .eq("id", id)
        .returns<RoomEntity[]>();

      if (!data || data.length === 0) {
        return response
          .status(404)
          .json({ message: findRoomError?.message ?? "Room not found" });
      }

      const room = data[0];

      if (room.players.includes(player)) {
        // already in room, no-op for idempotency
        return response.status(204).end();
      }

      if (room.players.length >= ROOM_MAX) {
        return response.status(409).json({ message: "Room is full" });
      }

      // add self to room
      room.players = [...room.players, player];
      room.last_touched = new Date();

      const { error } = await supabase.from("Rooms").update(room).eq("id", id);

      if (error) {
        return response.status(409).json({ message: error.message });
      }

      // pub update to realtime lobby channel
      const channel = realtime.channels.get("Lobby");
      channel.publish("update", JSON.stringify(room));
      channel.detach();

      return response.status(204).end();
    } else if (request.method === "DELETE") {
      const player: string = session.user.nickname ?? session.user.name;

      const { data, error: findRoomError } = await supabase
        .from("Rooms")
        .select()
        .eq("id", id)
        .returns<RoomEntity[]>();

      if (!data || data.length === 0) {
        return response
          .status(404)
          .json({ message: findRoomError?.message ?? "Room not found" });
      }

      const room = data[0];

      if (!room.players.includes(player)) {
        // not in room, no-op for idempotency
        return response.status(204).end();
      }

      if (room.host === player) {
        // if host leaves, room is gone

        const { error: deleteError } = await supabase
          .from("Rooms")
          .delete()
          .eq("id", id);

        if (deleteError) {
          return response.status(409).json({ message: deleteError.message });
        }

        // pub update to realtime lobby channel
        const channel = realtime.channels.get("Lobby");
        channel.publish("delete", JSON.stringify(room));
        channel.detach();

        return response.status(204).end();
      }

      // remove self from room
      room.players = room.players.filter((p) => p !== player);
      room.last_touched = new Date();

      const { error } = await supabase.from("Rooms").update(room).eq("id", id);

      // pub update to realtime lobby channel
      const channel = realtime.channels.get("Lobby");
      channel.publish("update", JSON.stringify(room));
      channel.detach();

      if (error) {
        return response.status(409).json({ message: error.message });
      }
    } else {
      return response.status(405);
    }
  } catch (e) {
    return response.status(500).json({ message: "An unknown error occurred" });
  }
});
