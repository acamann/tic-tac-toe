import type { VercelRequest, VercelResponse } from '@vercel/node';
import Redis from "ioredis";
import { randomUUID } from 'crypto';
import Ably from 'ably';

if (!process.env.VITE_UPSTASH_CONNECTION_URL) {
  throw new Error("Missing required environment variable VITE_UPSTASH_CONNECTION_URL");
}

const redis = new Redis(process.env.VITE_UPSTASH_CONNECTION_URL);

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
      const { code } = request.query;
      if (!code || Array.isArray(code)) {
        return response.status(400).json({ message: "A single code paramter is required" });
      }
      return await joinExistingCode(code, request, response);
    } else {
      return response.status(405);
    }
  } catch (e) {
    return response.status(500).json({ message: "An unknown error occurred" });
  }
}

const joinExistingCode = async (code: string, request: VercelRequest, response: VercelResponse): Promise<VercelResponse> => {
  const pairing = await redis.get(code);
  
  if (!pairing) {
    return response.status(409).json({ message: "Unknown Pairing Code" });
  }

  const { player1 } = JSON.parse(pairing);

  // TODO: get from auth
  const player2 = "2nd requestor";

  const gameId = randomUUID();

  // store game
  await redis.set(gameId, JSON.stringify({ gameId, player1, player2 }), 'EX', 600);

  // pub game id to any subscribed clients (other half of pair)
  const channel = realtime.channels.get(code);
  channel.publish("gameId", gameId);
  channel.detach();

  // remove pairing code now that we're paired (or could just let it expire)
  await redis.del(code);

  return response.status(200).json({ gameId });
}