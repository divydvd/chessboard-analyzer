
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Grid3X3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserButton } from '@/components/auth/UserButton';
import { ImageAnalyzer } from '@/components/ImageAnalyzer';
import { AdBanner } from '@/components/ads/AdBanner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Analyze = () => {
  const [adBlockerDetected, setAdBlockerDetected] = useState(false);

  const handleAdBlockDetected = () => {
    setAdBlockerDetected(true);
  };

  if (adBlockerDetected) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive" className="mb-4">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Ad Blocker Detected</AlertTitle>
            <AlertDescription>
              <p className="mb-4">
                ChessVision is supported by advertisements. Please disable your ad blocker to continue using our services.
              </p>
              <Button 
                className="w-full" 
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Page
              </Button>
            </AlertDescription>
          </Alert>
          
          <div className="text-center mt-6">
            <Link to="/" className="text-sm hover:text-primary transition-colors">
              <ChevronLeft className="h-4 w-4 inline mr-1" />
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="w-full px-8 py-6 flex justify-between items-center glass-morphism fixed top-0 z-50">
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center space-x-2">
            <Grid3X3 className="h-6 w-6" />
            <h1 className="text-xl font-medium">ChessVision</h1>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-sm hover:text-primary transition-colors">
            <ChevronLeft className="h-4 w-4 inline mr-1" />
            Back to Home
          </Link>
          <ThemeToggle />
          <UserButton />
        </div>
      </header>

      <main className="pt-32 pb-20 px-8 max-w-4xl mx-auto">
        <motion.div 
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold mb-6 text-center">Chess Position Analyzer</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-10 text-center">
            Upload a chess position image and get instant PGN notation for analysis
          </p>

          <AdBanner 
            position="top" 
            className="w-full max-w-md mb-6" 
            onAdBlockDetected={handleAdBlockDetected}
          />
          
          <div className="w-full max-w-md">
            <ImageAnalyzer />
          </div>
          
          <AdBanner 
            position="bottom" 
            className="w-full max-w-md mt-10" 
            onAdBlockDetected={handleAdBlockDetected}
          />
        </motion.div>
      </main>

      <footer className="py-10 px-8 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Grid3X3 className="h-5 w-5" />
            <span className="font-medium">ChessVision</span>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a>
          </div>
          <div className="mt-4 md:mt-0 text-sm text-muted-foreground">
            © 2023 ChessVision. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Analyze;
