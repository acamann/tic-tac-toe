import { createContext, useContext } from "react";
import * as Ably from 'ably';

if (!process.env.NEXT_PUBLIC_ABLY_API_KEY) {
  throw new Error("Missing NEXT_PUBLIC_ABLY_API_KEY");
}
const client = new Ably.Realtime(process.env.NEXT_PUBLIC_ABLY_API_KEY);

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