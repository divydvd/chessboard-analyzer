
import { useAuth } from "@/components/auth/AuthProvider";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";
import { UserButton as ClerkUserButton } from "@clerk/clerk-react";

export function UserButton() {
  const { isSignedIn, signOut } = useAuth();

  if (!isSignedIn) {
    return <div className="h-8 w-8 rounded-full bg-muted"></div>;
  }

  // Use Clerk's UserButton for a better user experience
  return (
    <ClerkUserButton afterSignOutUrl="/" />
  );
}
