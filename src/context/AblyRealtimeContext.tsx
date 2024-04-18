import { createContext, useContext } from "react";
import * as Ably from 'ably';

const client = new Ably.Realtime({ authUrl: '/api/auth/realtime' });

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