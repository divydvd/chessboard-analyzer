
import React from 'react';
import { SignIn } from "@clerk/clerk-react";
import { Grid3X3 } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full px-8 py-6 flex justify-between items-center glass-morphism fixed top-0 z-50">
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center space-x-2">
            <Grid3X3 className="h-6 w-6" />
            <h1 className="text-xl font-medium">ChessVision</h1>
          </Link>
        </div>
        <ThemeToggle />
      </header>
      
      <main className="flex-grow flex items-center justify-center py-20 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome to ChessVision</h1>
            <p className="text-muted-foreground">Sign in to analyze chess positions and save your history</p>
          </div>
          
          <div className="bg-card border rounded-lg shadow-sm p-6">
            <SignIn 
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "w-full shadow-none p-0 border-0",
                  headerTitle: "text-xl font-semibold",
                  headerSubtitle: "text-sm text-muted-foreground",
                  socialButtonsBlockButton: "border border-input bg-background hover:bg-accent",
                  formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
                  footerAction: "text-sm",
                  formFieldLabel: "text-sm font-medium text-foreground",
                  formFieldInput: "bg-background border border-input",
                }
              }}
              signUpUrl="/signup"
              redirectUrl="/analyze"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
