import type { NextApiRequest, NextApiResponse } from 'next'
import Ably from 'ably';
import { withApiAuthRequired } from '@auth0/nextjs-auth0';

if (!process.env.ABLY_API_KEY) {
  throw new Error("Missing ABLY_API_KEY");
}

const realtime = new Ably.Realtime({ key: process.env.ABLY_API_KEY });
 
export default withApiAuthRequired(async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    if (request.method === "GET") {

      // const session = await getSession(request, response);
      // if (!session) { 
      //   return response.status(401).end();
      // }
      // attempt to use user info as client-id

      realtime.auth.createTokenRequest({ clientId: "tic-tac-toe-ably-client" }, (err, tokenRequest) => {
        if (err) {
          return response.status(500).json({ message: err.message });
        } else {
          return response.status(200).json(tokenRequest);
        }
      });
    } else {
      return response.status(405).end();
    }
  } catch (e) {
    return response.status(500).json({ message: "An unknown error occurred" });
  }
});