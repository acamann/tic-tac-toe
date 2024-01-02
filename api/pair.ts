import type { VercelRequest, VercelResponse } from '@vercel/node';
import Redis from "ioredis";
import { generatePairingCode } from "./_pairing-utils.js";
import { randomUUID } from 'crypto';

if (!process.env.VITE_UPSTASH_CONNECTION_URL) {
  throw new Error("Missing required environment variable VITE_UPSTASH_CONNECTION_URL");
}

const redis = new Redis(process.env.VITE_UPSTASH_CONNECTION_URL);

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  try {
    if (request.method === "GET") {
      const { code } = request.query;
      if (code) {
        if (Array.isArray(code)) {
          return response.status(400).json({ message: "Only a single pairing code is allowed" });
        }
        return await pairToExistingCode(code, request, response);
      }

      return await getNewPairingCode(request, response);
    } else {
      return response.status(405);
    }
  } catch (e) {
    return response.status(500).json({ message: "An unknown error occurred" });
  }
}

const getNewPairingCode = async (request: VercelRequest, response: VercelResponse): Promise<VercelResponse> => {

  // TODO: get from auth
  const player1 = "1st requestor";

  const code = generatePairingCode();

  const pairing: Pairing = {
    code,
    player1,
  }

  await redis.set(code, JSON.stringify(pairing), 'EX', 60);

  // recipient will use code to subscribe to events (to know when paired & get game id)

  return response.status(201).json({ code });
}

type Pairing = {
  code: string;
  player1: string;
}

const pairToExistingCode = async (code: string, request: VercelRequest, response: VercelResponse): Promise<VercelResponse> => {
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
  await redis.publish(code, gameId);

  // remove pairing code now that we're paired (or could just let it expire)
  await redis.del(code);

  return response.status(200).json({ gameId });
}