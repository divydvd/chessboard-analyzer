
import { UserButton as ClerkUserButton } from "@clerk/clerk-react";
import { useTheme } from "@/hooks/use-theme";

export function UserButton() {
  const { theme } = useTheme();
  
  return (
    <ClerkUserButton 
      appearance={{
        baseTheme: theme === "dark" ? "dark" : "light",
        elements: {
          userButtonBox: "h-8 w-8"
        }
      }}
    />
  );
}
