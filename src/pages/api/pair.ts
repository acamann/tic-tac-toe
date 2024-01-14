import type { NextApiRequest, NextApiResponse } from 'next'
import { generatePairingCode } from "./../../utils/pairing";
import { Redis } from "ioredis";

if (!process.env.UPSTASH_CONNECTION_URL) {
  throw new Error("Missing required environment variable UPSTASH_CONNECTION_URL");
}

const redis = new Redis(process.env.UPSTASH_CONNECTION_URL);

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    if (request.method === "GET") {

      const { player } = request.query;
      if (!player || Array.isArray(player)) {
        // TODO: get this from auth access token instead
        return response.status(400).json({ message: "A player name is required" });
      }

      const codeExpirationSeconds = 90;
      const code = generatePairingCode();

      const pairing = {
        code,
        player1: player,
      }

      await redis.set(code, JSON.stringify(pairing), 'EX', codeExpirationSeconds );

      return response.status(200).json({ code, expiration: codeExpirationSeconds });
    } else {
      return response.status(405);
    }
  } catch (e) {
    return response.status(500).json({ message: "An unknown error occurred" });
  }
}