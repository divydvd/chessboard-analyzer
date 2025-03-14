
import { useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  // Get auth state from Clerk
  const { isLoaded, isSignedIn } = useAuth();
  
  // Check if Clerk is available (publishable key is set)
  const isClerkAvailable = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  
  // If Clerk is not available, just render the children
  if (!isClerkAvailable) {
    console.warn("Clerk authentication is not configured. Protected routes will be accessible without authentication.");
    return <>{children}</>;
  }

  if (!isLoaded) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!isSignedIn) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}
