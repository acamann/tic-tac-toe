import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";

if (!import.meta.env.VITE_AUTH_0_DOMAIN) {
  throw new Error("Missing VITE_AUTH_0_DOMAIN");
}
const domain = import.meta.env.VITE_AUTH_0_DOMAIN;

if (!import.meta.env.VITE_AUTH_0_CLIENT_ID) {
  throw new Error("Missing VITE_AUTH_0_CLIENT_ID");
}
const clientId = import.meta.env.VITE_AUTH_0_CLIENT_ID;

export const useAuth = useAuth0;

const AuthProvider = ({ children }: React.PropsWithChildren) => {
  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin
      }}
    >
      {children}
    </Auth0Provider>
  );
};

export default AuthProvider;