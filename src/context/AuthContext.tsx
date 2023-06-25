import { AuthResponse, AuthTokenResponse, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import supabase from "./../database/supabaseClient";

type AuthContextType = {
  user: User | null,
  login: (email: string, password: string) => Promise<AuthTokenResponse>,
  register: (email: string, password: string) => Promise<AuthResponse>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }: React.PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);

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

  // TODO: log out

  useEffect(() => {
    initializeUser();
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        setUser(session.user);
      }
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider 
      value={{
        user,
        login,
        register
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;