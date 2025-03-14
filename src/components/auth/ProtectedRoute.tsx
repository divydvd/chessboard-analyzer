
import { ReactNode } from "react";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  // Authentication check removed as requested
  return <>{children}</>;
}
