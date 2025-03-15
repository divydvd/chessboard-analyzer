
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.tsx'
import './index.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

createRoot(document.getElementById("root")!).render(
  <ClerkProvider 
    publishableKey={PUBLISHABLE_KEY}
    appearance={{
      elements: {
        formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
        card: 'bg-background',
        headerTitle: 'text-foreground',
        headerSubtitle: 'text-muted-foreground',
        formFieldLabel: 'text-foreground',
        formFieldInput: 'bg-background border-input',
        footerActionLink: 'text-primary hover:text-primary/90'
      }
    }}
    localization={{
      signIn: {
        start: {
          title: "Sign in to ChessVision",
          subtitle: "to continue to ChessVision"
        }
      },
      signUp: {
        start: {
          title: "Create your ChessVision account",
          subtitle: "to get started with ChessVision"
        }
      }
    }}>
    <App />
  </ClerkProvider>
);
