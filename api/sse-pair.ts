// TODO: this is unused now, but proven out

import { generatePairingCode } from "../src/utils/PairingUtils";
//import { Redis } from "ioredis";
import { Redis } from "@upstash/redis";

export const config = {
  runtime: 'edge',
};

if (
  !process.env.VITE_UPSTASH_REDIS_REST_URL ||
  !process.env.VITE_UPSTASH_REDIS_REST_TOKEN
) {
  throw new Error("Missing VITE_UPSTASH_REDIS_REST_URL or VITE_UPSTASH_REDIS_REST_TOKEN");
}

// Create a Redis client outside of the function
const redis = new Redis({
  url: process.env.VITE_UPSTASH_REDIS_REST_URL,
  token: process.env.VITE_UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(request: Request) {
  if (request.method === "GET") {
    // TODO: get from auth
    const player1 = "requestor";

    let interval: NodeJS.Timeout;
    const body = new ReadableStream({
      start(controller) {
        interval = setInterval(async () => {
          const code = generatePairingCode();

          const pairing = {
            code,
            player1,
          }

          await redis.set(code, JSON.stringify(pairing), { ex: 120 });
          controller.enqueue(new TextEncoder().encode(`data: code=${code}\n\n`));
        }, 120000)

        // start subscribing and listening for events from redis
      },
      cancel() {
        if (interval) {
          clearInterval(interval);
        }
        // unsubscribe
      },
    });

    return new Response(body, {
      headers: {
        "Content-Type": "text/event-stream",
      },
    });
  } else {
    return new Response(JSON.stringify({ message: "Unsupported method" }), {
      status: 405,
      headers: { 
        "Content-Type": "text/json",
      }
    });
  }
}