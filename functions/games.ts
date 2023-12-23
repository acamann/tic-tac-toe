import { Handler, HandlerEvent } from '@netlify/functions'

const handler: Handler = async (event, context) => {
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

  const { player: player1 } = JSON.parse(event.body);
  const code = "ABCD";

  return {
    statusCode: 201,
    body: JSON.stringify({ code, player1 })
  }
}

const getGames = async () => {
  const games = [
    { code: "ABCD", player1: "Andy", player2: "Sarah" },
    { code: "EFGH", player1: "Daniel", player2: "Luke" },
  ];

  return {
    statusCode: 200,
    body: JSON.stringify({ games })
  }
}

export { handler }