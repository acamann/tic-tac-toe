import {
  AppRouteHandlerFnContext,
  handleAuth,
  handleCallback,
  handleLogin,
  handleLogout,
} from "@auth0/nextjs-auth0";
import { NextRequest } from "next/server";

// Thank you https://github.com/auth0/nextjs-auth0/issues/108#issuecomment-800059278
export default handleAuth({
  login: async (req: NextRequest, res: AppRouteHandlerFnContext) => {
    const { redirectUri, returnTo } = getAuth0Urls(req);
    return await handleLogin(req as NextRequest, res, {
      authorizationParams: {
        redirect_uri: redirectUri,
      },
      returnTo,
    });
  },
  callback: async (req: NextRequest, res: AppRouteHandlerFnContext) => {
    const { redirectUri } = getAuth0Urls(req);
    return await handleCallback(req, res, {
      redirectUri,
    });
  },
  logout: async (req: NextRequest, res: AppRouteHandlerFnContext) => {
    const { returnTo } = getAuth0Urls(req);
    return await handleLogout(req, res, {
      returnTo,
    });
  },
});

// Get baseURL value from request at runtime instead of environment variable
function getAuth0Urls(req: NextRequest) {
  // kind of gross TS
  const host = (req.headers as unknown as { host: string })["host"];
  const protocol = process.env.VERCEL_URL ? "https" : "http";

  return {
    baseURL: `${protocol}://${host}`,
    redirectUri: `${protocol}://${host}/api/auth/callback`,
    returnTo: `${protocol}://${host}`,
  };
}
