import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { createContext, useContext  } from "react";

type DBContextType = {
  supabase: SupabaseClient;
}

const DBContext = createContext<DBContextType>({} as DBContextType);

export const useDB = () => useContext(DBContext);

const DBProvider = ({ children }: React.PropsWithChildren) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "unset";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY ?? "unset";
  const supabase = createClient(supabaseUrl, supabaseKey);

  return (
    <DBContext.Provider 
      value={{
        supabase
      }}
    >
      {children}
    </DBContext.Provider>
  );
};

export default DBProvider;