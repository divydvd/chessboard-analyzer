
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  
  // Show a loading state while Clerk is initializing
  if (!isLoaded) {
    return <div className="flex h-screen items-center justify-center">Loading authentication...</div>;
  }
  
  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}
