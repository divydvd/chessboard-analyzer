
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
        footerActionLink: 'text-primary hover:text-primary/90',
        socialButtonsIconButton: 'dark:text-white dark:fill-white',
        socialButtonsBlockButton: 'dark:border-white/20 dark:text-white',
        socialButtonsBlockButtonText: 'dark:text-white',
        dividerLine: 'dark:bg-white/20',
        dividerText: 'dark:text-white/70',
        formFieldAction: 'dark:text-white/70',
        formFieldSuccessText: 'dark:text-white/70',
        otpCodeFieldInput: 'dark:border-white/20 dark:text-white',
        socialButtonsProviderIcon: 'dark:text-white dark:fill-white',
        logoBox: 'dark:text-white',
        identityPreviewEditButton: 'dark:text-white',
        badge: 'dark:text-white/70',
        rootBox: 'bg-background text-foreground',
        card: 'bg-card text-card-foreground border border-border shadow-sm',
        navbar: 'bg-background border-b border-border',
      },
      variables: {
        colorPrimary: 'hsl(var(--primary))',
        colorBackground: 'hsl(var(--background))',
        colorText: 'hsl(var(--foreground))',
        colorTextSecondary: 'hsl(var(--muted-foreground))',
        colorTextOnPrimaryBackground: 'hsl(var(--primary-foreground))',
        colorInputBackground: 'hsl(var(--background))',
        colorInputText: 'hsl(var(--foreground))',
        fontFamily: 'var(--font-sans)',
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
    }}
  >
    <App />
  </ClerkProvider>
);
