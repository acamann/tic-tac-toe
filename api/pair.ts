import { generatePairingCode } from "../src/utils/PairingUtils";
//import Redis from "ioredis";
//import { Redis } from "https://deno.land/x/upstash_redis@v1.3.2/mod.ts";

export const config = {
  runtime: 'edge',
};

//const redisConnectionString = Netlify.env.get("VITE_DB_CONNECTION_URL");
//const redis = new Redis(redisConnectionString);

// export default async function handler(request: Request, context: Context) {
//   console.log("params", context.params);
//   console.log("method", request.method);
//   //const redis = Redis.fromEnv();
//   //await redis.set("code", "ABCD", { ex: 60 });
//   //const code = await redis.get("code") as string;
//   await Promise.resolve();
//   const code = "ABCD";
//   return new Response(code, {
//     status: 200,
//     headers: { "Content-Type": "text/json" },
//   });
// }

export default async function handler(request: Request) {
  if (request.method === "GET") {
    // TODO: get from auth
    const player1 = "requestor";
    const code = generatePairingCode();

    // const pairing = {
    //   code,
    //   player1,
    // }

    await Promise.resolve();
    //await redis.set(code, JSON.stringify(pairing), 'EX', 60);

    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(`data: code=${code}\n\n`));

        // start subscribing and listening for events from redis
      },
      cancel() {
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