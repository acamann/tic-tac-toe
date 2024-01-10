import { createContext, useContext } from "react";
import * as Ably from 'ably';

if (!import.meta.env.VITE_ABLY_API_KEY) {
  throw new Error("Missing VITE_ABLY_API_KEY");
}
const client = new Ably.Realtime(import.meta.env.VITE_ABLY_API_KEY);

type AblyRealtimeContextType = {
  client: Ably.Realtime;
}

const AblyRealtimeContext = createContext<AblyRealtimeContextType>({} as AblyRealtimeContextType);

export const useAblyRealtime = () => useContext(AblyRealtimeContext);

const AblyRealtimeProvider = ({ children }: React.PropsWithChildren) => {
   return (
    <AblyRealtimeContext.Provider 
      value={{
        client
      }}
    >
      {children}
    </AblyRealtimeContext.Provider>
  );
};

export default AblyRealtimeProvider;