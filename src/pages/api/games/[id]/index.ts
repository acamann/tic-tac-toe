import type { NextApiRequest, NextApiResponse } from 'next'
import { withApiAuthRequired } from '@auth0/nextjs-auth0';
import { createClient } from '@supabase/supabase-js';
import { GameEntity } from './../../../../types/models';

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

export default withApiAuthRequired(async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    const { id } = request.query;

    if (request.method === "GET") {
      const {
        data,
        error
      } = await supabase.from('Games')
        .select()
        .eq('game_id', id)
        .returns<[GameEntity] | []>();

      if (error) {
        return response.status(409).json({ message: error.message });
      }

      if (data.length === 0) {
        return response.status(404).json({ message: "Unknown game id" });
      }

      return response.status(200).json(data[0]);
    } else {
      return response.status(405);
    }
  } catch (e) {
    return response.status(500).json({ message: "An unknown error occurred" });
  }
});