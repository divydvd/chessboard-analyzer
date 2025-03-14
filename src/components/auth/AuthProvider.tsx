
import { ClerkProvider } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import { useTheme } from "@/hooks/use-theme";
import { ReactNode } from "react";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';
  
  // Render children directly if no key is available
  if (!clerkPubKey) {
    console.warn("Missing Clerk publishable key. Some authentication features will be disabled.");
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      appearance={{
        baseTheme: theme === "dark" ? dark : undefined,
      }}
    >
      {children}
    </ClerkProvider>
  );
}
