
import { createContext, ReactNode, useContext, useState } from "react";

type AuthContextType = {
  isSignedIn: boolean;
  isLoaded: boolean;
  signIn: () => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(true);

  // Simple auth functions
  const signIn = () => setIsSignedIn(true);
  const signOut = () => setIsSignedIn(false);

  return (
    <AuthContext.Provider value={{ isSignedIn, isLoaded, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
