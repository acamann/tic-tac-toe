import { createContext, useContext } from "react";
import * as Ably from 'ably';

type AblyRealtimeContextType = {
  client: Ably.Realtime;
}

const AblyRealtimeContext = createContext<AblyRealtimeContextType>({} as AblyRealtimeContextType);

export const useAblyRealtime = () => useContext(AblyRealtimeContext);

const AblyRealtimeProvider = ({ children }: React.PropsWithChildren) => {
  const client = new Ably.Realtime({ authUrl: '/api/realtime/token' });

   return (
    <AblyRealtimeContext.Provider value={{ client }}>
      {children}
    </AblyRealtimeContext.Provider>
  );
};

export default AblyRealtimeProvider;