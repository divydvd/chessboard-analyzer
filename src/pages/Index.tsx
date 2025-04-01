import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Grid3X3, ChevronRight, Image, Shield, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AdBanner } from '@/components/ads/AdBanner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

const Index = () => {
  const [adBlockerDetected, setAdBlockerDetected] = useState(false);

  const handleAdBlockDetected = () => {
    setAdBlockerDetected(true);
  };

  if (adBlockerDetected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full px-8 py-6 flex justify-between items-center glass-morphism">
        <div className="flex items-center space-x-2">
          <Grid3X3 className="h-6 w-6" />
          <h1 className="text-xl font-medium">ChessVision</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/analyze">
            <Button variant="outline" size="sm">
              Go to Analyzer
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-grow pt-20 pb-20 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="flex flex-col items-center text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Chess Position Analysis
              <br /> Made <span className="text-primary">Simple</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">
              Upload a chess position image and get instant PGN notation for analysis on Lichess
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/analyze">
                <Button size="lg" className="text-base">
                  Analyze Position
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </motion.div>

          <AdBanner 
            position="top" 
            className="w-full max-w-4xl mx-auto mb-14" 
            onAdBlockDetected={handleAdBlockDetected}
          />

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-card border rounded-lg p-6 shadow-sm">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Image className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Image to PGN</h3>
              <p className="text-muted-foreground">
                Upload a chess position image and instantly get PGN notation for analysis
              </p>
            </div>

            <div className="bg-card border rounded-lg p-6 shadow-sm">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Grid3X3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Analyze on Lichess</h3>
              <p className="text-muted-foreground">
                One-click analysis on Lichess to get instant evaluation and explore variations
              </p>
            </div>

            <div className="bg-card border rounded-lg p-6 shadow-sm">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Advanced Features</h3>
              <p className="text-muted-foreground">
                Paste images directly, use image URLs, and analyze positions instantly
              </p>
            </div>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold mb-6">Ready to analyze your chess positions?</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              Start analyzing chess positions from images with our AI-powered tool.
            </p>
            <Link to="/analyze">
              <Button size="lg">
                Go to Analyzer
              </Button>
            </Link>
          </motion.div>
          
          <AdBanner 
            position="bottom" 
            className="w-full max-w-4xl mx-auto mt-20" 
            onAdBlockDetected={handleAdBlockDetected}
          />
        </div>
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

export default Index;
