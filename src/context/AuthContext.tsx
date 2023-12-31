import { AuthError, AuthResponse, AuthTokenResponse, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import { useDB } from "./DBContext";

type AuthContextType = {
  user: User | null,
  login: (email: string, password: string) => Promise<AuthTokenResponse>,
  register: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }: React.PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);

  const { supabase } = useDB();

  const initializeUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data) {
      setUser(data.user);
    }
  };

  const register = async (email: string, password: string): Promise<AuthResponse> =>
    await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin
      }
    });

  const login = async (email: string, password: string): Promise<AuthTokenResponse> =>
    await supabase.auth.signInWithPassword({
      email,
      password
    });

  const logout = async (): Promise<{ error: AuthError | null }> =>
    await supabase.auth.signOut();

  useEffect(() => {
    initializeUser();
  }, [])

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        setUser(session.user);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  return (
    <AuthContext.Provider 
      value={{
        user,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;