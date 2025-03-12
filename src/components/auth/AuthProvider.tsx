
import { ClerkProvider } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import { useTheme } from "@/hooks/use-theme";
import { ReactNode } from "react";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  
  if (!clerkPubKey) {
    console.error("Missing Clerk publishable key. Please add VITE_CLERK_PUBLISHABLE_KEY to your environment variables.");
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
