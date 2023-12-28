import { Handler, HandlerEvent } from '@netlify/functions'
import Redis from "ioredis";
import { generatePairingCode } from "../src/utils/PairingUtils";

const redis = new Redis(process.env.VITE_DB_CONNECTION_URL ?? "");

const handler: Handler = async (event, context) => {
  try {
    if (event.httpMethod === "GET") {
      if (event.queryStringParameters?.["code"]) {
        return join(event);
      }
      return getPairingCode(event);
    } else {
      return { statusCode: 405 };
    }
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "An unknown error occurred" })
    }
  }
}

const getPairingCode = async (event: HandlerEvent) => {
  // TODO: get from auth
  const player1 = "requestor";

  const code = generatePairingCode();

  const pairing: Pairing = {
    code,
    player1,
  }

  await redis.set(code, JSON.stringify(pairing), 'EX', 60);

  return {
    statusCode: 201,
    body: JSON.stringify({ code })
  }
}

type Pairing = {
  code: string;
  player1: string;
}

const join = async (event: HandlerEvent) => {
  const code = event.queryStringParameters?.["code"];
  if (!code) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing Pairing Code"})
    }
  }

  const pairing = await redis.get(code);
  if (!pairing) {
    return {
      statusCode: 409,
      body: JSON.stringify({ error: "Unknown Pairing Code" })
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "all good!" })
  }
}

export { handler }