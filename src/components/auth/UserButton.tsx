
import { useAuth } from "@/components/auth/AuthProvider";
import { UserButton as ClerkUserButton } from "@clerk/clerk-react";

export function UserButton() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <div className="h-8 w-8 rounded-full bg-muted"></div>;
  }

  // Use Clerk's UserButton for a better user experience
  return (
    <ClerkUserButton afterSignOutUrl="/" />
  );
}
