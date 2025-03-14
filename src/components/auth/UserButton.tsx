
import { UserButton as ClerkUserButton } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import { useTheme } from "@/hooks/use-theme";

export function UserButton() {
  const { theme } = useTheme();
  
  // Check if Clerk is available
  const isClerkAvailable = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  
  // If Clerk is not configured, show a placeholder
  if (!isClerkAvailable) {
    return <div className="h-8 w-8 rounded-full bg-muted"></div>;
  }
  
  return (
    <ClerkUserButton 
      appearance={{
        baseTheme: theme === "dark" ? dark : undefined,
        elements: {
          userButtonBox: "h-8 w-8"
        }
      }}
    />
  );
}
