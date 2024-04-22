import type { NextApiRequest, NextApiResponse } from "next";
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { createClient } from "@supabase/supabase-js";
import { GameEntity, Move, MoveRequest } from "./../../../../types/models";
import Ably from "ably";
import {
  getNewBoard,
  getWinner,
  isDraw,
  isValidMove,
} from "../../../../utils/BoardUtils";

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

interface MovesNextApiRequest extends NextApiRequest {
  body: MoveRequest;
}

export default withApiAuthRequired(async function handler(
  request: MovesNextApiRequest,
  response: NextApiResponse,
) {
  try {
    const { id: game_id } = request.query;
    if (!game_id || Array.isArray(game_id)) {
      return response.status(400).json({ message: "Invalid game id" });
    }

    if (request.method === "PUT") {
      const { data: currentGameData, error: currentGameError } = await supabase
        .from("Games")
        .select()
        .eq("game_id", game_id)
        .returns<[GameEntity] | []>();

      if (currentGameError) {
        return response.status(500).json({ message: currentGameError.message });
      }

      if (currentGameData.length === 0) {
        return response.status(404).json({ message: "Unknown game id" });
      }

      const game = currentGameData[0];

      const session = await getSession(request, response);
      if (!session) {
        return response.status(401);
      }
      const playerName = session.user.nickname ?? session.user.name;

      if (!(playerName === game.player0 || playerName === game.player1)) {
        return response.status(403).json({
          message: "Authenticated user is not a participant of this game",
        });
      }

      const playerIndex = playerName === game.player0 ? 0 : 1;
      const playerIndexAsBool = playerIndex === 1 ? true : false; // still kind of gross

      if (game.is_draw || game.winner) {
        return response
          .status(409)
          .json({ message: `The game is already over.` });
      }
      if (game.current_turn !== playerIndexAsBool) {
        return response.status(409).json({ message: "It's not your turn" });
      }

      const move: Move = {
        ...request.body,
        player: playerIndex,
      };

      console.log(move);

      if (!isValidMove(game.board, move)) {
        return response.status(409).json({ message: "Invalid move" });
      }

      const newBoard = getNewBoard(game.board, move);
      const winner = getWinner(newBoard);

      const updatedGameData: GameEntity = {
        ...game,
        board: newBoard,
        current_turn: winner === null ? !game.current_turn : null,
        winner:
          winner === 0 ? game.player0 : winner === 1 ? game.player1 : null,
        is_draw: isDraw(newBoard),
      };

      const { error: updateError } = await supabase
        .from("Games")
        .update(updatedGameData)
        .eq("game_id", game_id);

      if (updateError) {
        return response.status(500).json({ message: updateError.message });
      }

      // pub game state to any subscribed participants
      const channel = realtime.channels.get(game_id);
      channel.publish("game", JSON.stringify(updatedGameData));
      channel.detach();

      return response.status(204).end();
    } else {
      return response.status(405).end();
    }
  } catch (e) {
    console.error(e);
    return response.status(500).json({ message: "An unknown error occurred" });
  }
});
