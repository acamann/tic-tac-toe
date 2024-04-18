import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import Ably from "ably";

if (!process.env.ABLY_API_KEY) {
  throw new Error("Missing ABLY_API_KEY");
}
const ably = new Ably.Realtime(process.env.ABLY_API_KEY);

export default withApiAuthRequired(async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    if (request.method === "GET") {
      const session = await getSession(request, response);
      if (!session) {
        return response.status(401);
      }

      //TODO: probably there's a better way
      let tokenRequest;
      await ably.auth.createTokenRequest({ clientId: session.user.nickname }, null, (err, result) => {
        if (err) {
          throw err;
        }
        tokenRequest = result;
      });

      return response.status(200).json(tokenRequest);
    } else {
      return response.status(405);
    }
  } catch (e) {
    return response.status(500).json({ message: "An unknown error occurred" });
  }
});