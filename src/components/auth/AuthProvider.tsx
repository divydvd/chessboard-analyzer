
import { createContext, ReactNode, useContext } from "react";
import { useUser, useAuth as useClerkAuth } from "@clerk/clerk-react";

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
  const { isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerkAuth();
  
  // This is a placeholder since Clerk handles the actual sign-in via its components
  const signIn = () => {
    console.log("Sign in should be handled by Clerk UI components");
    // We'll redirect to the /login page
    window.location.href = "/login";
  };

  // Provide the auth context to the rest of the app
  return (
    <AuthContext.Provider value={{ 
      isSignedIn: !!isSignedIn, 
      isLoaded: isLoaded, 
      signIn, 
      signOut: () => signOut() 
    }}>
      {children}
    </AuthContext.Provider>
  );
}
