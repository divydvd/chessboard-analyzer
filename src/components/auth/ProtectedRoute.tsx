
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isSignedIn } = useAuth();
  
  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}
