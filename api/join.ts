import type { VercelRequest, VercelResponse } from '@vercel/node';
import Redis from "ioredis";
import Ably from 'ably';
import { createClient } from "@supabase/supabase-js";
import { initialBoardState } from '../src/utils/BoardUtils.js';

// Redis Cache - for pairing code
if (!process.env.VITE_UPSTASH_CONNECTION_URL) {
  throw new Error("Missing required environment variable VITE_UPSTASH_CONNECTION_URL");
}

const redis = new Redis(process.env.VITE_UPSTASH_CONNECTION_URL);

if (!process.env.VITE_SUPABASE_URL) {
  throw new Error("Missing required environment variable VITE_SUPABASE_URL");
}
if (!process.env.VITE_SUPABASE_KEY) {
  throw new Error("Missing required environment variable VITE_SUPABASE_KEY");
}

// Supabase DB - for persisted game state
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

if (!process.env.VITE_ABLY_API_KEY) {
  throw new Error("Missing VITE_ABLY_API_KEY");
}

const realtime = new Ably.Realtime({ key: process.env.VITE_ABLY_API_KEY });

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  try {
    if (request.method === "GET") {
      const { code, player } = request.query;
      if (!code || Array.isArray(code)) {
        return response.status(400).json({ message: "A single code paramter is required" });
      }
      if (!player || Array.isArray(player)) {
        // TODO: get this from auth access token instead
        return response.status(400).json({ message: "A player name is required" });
      }
      return await joinExistingCode(code, player, request, response);
    } else {
      return response.status(405);
    }
  } catch (e) {
    return response.status(500).json({ message: "An unknown error occurred" });
  }
}

const joinExistingCode = async (code: string, player2: string, request: VercelRequest, response: VercelResponse): Promise<VercelResponse> => {
  const pairing = await redis.get(code);
  
  if (!pairing) {
    return response.status(409).json({ message: "Unknown Pairing Code" });
  }

  const { player1 } = JSON.parse(pairing);

  // generate from DB for now
  // TODO: consider putting gamestate in redis
  //const gameId = randomUUID();

  // store game
  const {
    data: gameDataResult ,
    error: createGameError
  } = await supabase.from('Games')
    .insert({
      player0: player1,
      player1: player2,
      board: initialBoardState,
      current_turn: 0
    })
    .select();

  if (createGameError) {
    return response.status(409).json({ message: createGameError.message });
  }

  const game = gameDataResult[0];

  // pub game id to any subscribed clients (other half of pair)
  const channel = realtime.channels.get(code);
  channel.publish("game", JSON.stringify(game));
  channel.detach();

  // remove pairing code now that we're paired (or could just let it expire)
  await redis.del(code);

  return response.status(200).json({ game });
}