import type { NextApiRequest, NextApiResponse } from 'next'
import { withApiAuthRequired } from '@auth0/nextjs-auth0';
import { createClient } from '@supabase/supabase-js';

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
    if (request.method === "GET") {
      const { data = [] } = await supabase
        .from('leaderboard')
        .select("winner, wins");
        
      return response.status(200).json(data);
    } else {
      return response.status(405);
    }
  } catch (e) {
    return response.status(500).json({ message: "An unknown error occurred" });
  }
});