import { Handler, HandlerEvent } from '@netlify/functions'
import Redis from "ioredis";
import { generatePairingCode } from "../src/utils/PairingUtils";

const redis = new Redis(process.env.VITE_DB_CONNECTION_URL ?? "");

const handler: Handler = async (event, context) => {
  console.log(event.path);
  try {
    const ip = event.headers["x-forwarded-for"];

    switch (event.httpMethod) {
      case "POST": return createGame(event);
      case "GET": return getGames();
      default: return {
        statusCode: 405
      };
    }
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "An unknown error occurred" })
    }
  }
}

const createGame = async (event: HandlerEvent) => {
  if (!event.body) {
    return { statusCode: 400 }
  }

  const { username: player1 } = JSON.parse(event.body);
  const code = generatePairingCode();

  const game: Game = {
    code,
    player1,
  }

  await redis.set(code, JSON.stringify(game), 'EX', 60);
  await redis.zadd("pairing-codes", Date.now() + 10000, code);

  return {
    statusCode: 201,
    body: JSON.stringify({ code, player1 })
  }
}

type Game = {
  code: string;
  player1: string;
}

const getGames = async () => {
  // TODO: update this to get only already paired games
  const gameCodes = (await redis.zrangebyscore("pairing-codes", Date.now(), Infinity));

  const games = (await Promise.all(gameCodes.map(async (code) => {
    const game = await redis.get(code);
    if (game) {
      return JSON.parse(game) as Game;
    }
    return undefined;
  })))
  .filter(game => !!game) as Game[];

  return {
    statusCode: 200,
    body: JSON.stringify({ games })
  }
}

export { handler }