import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Send, Image, Grid3X3, Upload, Download, ExternalLink, Settings, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Header */}
      <header className="w-full px-8 py-6 flex justify-between items-center glass-morphism fixed top-0 z-50">
        <div className="flex items-center space-x-2">
          <Grid3X3 className="h-6 w-6" />
          <h1 className="text-xl font-medium">ChessVision</h1>
        </div>
        <div className="flex items-center space-x-4">
          <a href="#features" className="text-sm hover:text-primary transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm hover:text-primary transition-colors">How It Works</a>
          <Button className="bg-primary text-primary-foreground">Install Extension</Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-8 max-w-6xl mx-auto">
        <motion.div 
          className="flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-3 py-1 bg-secondary rounded-full text-xs font-medium mb-4">
            Chess Analysis Made Simple
          </div>
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Transform Chess Images Into <span className="text-primary">Playable Positions</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-10">
            ChessVision uses advanced AI to convert any chessboard image into PGN notation, 
            allowing instant analysis on Lichess with just a click.
          </p>
          <div className="flex space-x-4">
            <Button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg">
              Get Started <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
            <Button variant="outline" className="border-border">
              Watch Demo
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Browser Extension Preview */}
      <motion.section 
        className="py-16 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <div className="max-w-6xl mx-auto px-8 flex flex-col items-center">
          <div className="w-full max-w-md aspect-auto rounded-lg shadow-xl overflow-hidden border border-border">
            <div className="w-full h-10 bg-secondary flex items-center px-2 border-b border-border">
              <div className="flex space-x-1.5 mr-4">
                <div className="w-2.5 h-2.5 rounded-full bg-destructive"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-muted"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-muted"></div>
              </div>
              <div className="h-6 flex-1 bg-white rounded-md text-xs flex items-center justify-center text-muted-foreground">
                chrome-extension://chessboard-analyzer
              </div>
            </div>
            <div className="bg-background p-4 h-[480px] overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-xl font-medium">ChessVision</h1>
                  <p className="text-sm text-muted-foreground">Analyze chess positions from images</p>
                </div>
                <span className="text-xs px-2 py-1 bg-secondary rounded-full">Analyses: 2/3</span>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg mb-4 p-4">
                <div className="text-center">
                  <Upload className="mx-auto mb-2 text-muted-foreground h-6 w-6" />
                  <p className="text-sm font-medium mb-1">Upload chessboard image</p>
                  <p className="text-xs text-muted-foreground">Drag and drop or click to browse</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-border">
                <h2 className="text-sm font-medium mb-2">Recent Analyses</h2>
                <div className="text-xs space-y-2">
                  <div className="py-2 px-2 rounded hover:bg-secondary/50 cursor-pointer transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="font-medium truncate" style={{maxWidth: "200px"}}>Sicilian Defense: Classical</span>
                      <span className="text-muted-foreground">May 12, 2:45 PM</span>
                    </div>
                  </div>
                  <div className="py-2 px-2 rounded hover:bg-secondary/50 cursor-pointer transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="font-medium truncate" style={{maxWidth: "200px"}}>Queen's Gambit Accepted</span>
                      <span className="text-muted-foreground">May 10, 10:32 AM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="py-20 px-8 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Key Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              ChessVision combines powerful AI with chess analysis tools to give you a seamless experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Image className="h-6 w-6 text-primary" />}
              title="Image Recognition"
              description="Instantly capture and analyze chessboard images from any webpage or your device."
            />
            <FeatureCard 
              icon={<Send className="h-6 w-6 text-primary" />}
              title="AI-Powered PGN Generation"
              description="Advanced AI converts visual board positions into accurate PGN notation."
            />
            <FeatureCard 
              icon={<ExternalLink className="h-6 w-6 text-primary" />}
              title="Lichess Integration"
              description="One-click analysis on Lichess with your generated PGN for immediate insights."
            />
            <FeatureCard 
              icon={<Download className="h-6 w-6 text-primary" />}
              title="Export Options"
              description="Download or copy PGN data for use in any chess analysis software."
            />
            <FeatureCard 
              icon={<Flag className="h-6 w-6 text-primary" />}
              title="Freemium Model"
              description="Try 3 free analyses, with unlimited access available through premium subscription."
            />
            <FeatureCard 
              icon={<Settings className="h-6 w-6 text-primary" />}
              title="Customizable Settings"
              description="Configure API keys and preferences for a personalized experience."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Getting from image to analysis in three simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ProcessCard 
              number="01"
              title="Capture"
              description="Right-click on any chessboard image on the web or upload one from your device."
            />
            <ProcessCard 
              number="02"
              title="Convert"
              description="Our AI analyzes the image and generates the precise PGN notation of the position."
            />
            <ProcessCard 
              number="03"
              title="Analyze"
              description="The position opens automatically in Lichess for immediate analysis and play."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-8 bg-gradient-to-b from-background to-secondary/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Analyze Chess Positions?</h2>
          <p className="text-muted-foreground mb-8">
            Install the ChessVision extension and start transforming chessboard images into playable positions.
          </p>
          <Button className="bg-primary text-primary-foreground px-8 py-6 rounded-lg text-lg">
            Install Chrome Extension
          </Button>
          <p className="mt-4 text-xs text-muted-foreground">
            Available for Google Chrome. Firefox and Edge versions coming soon.
          </p>
        </div>
      </section>

      {/* Footer */}
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

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => {
  return (
    <motion.div 
      className="bg-card p-6 rounded-lg border border-border"
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </motion.div>
  );
};

const ProcessCard = ({ number, title, description }: { number: string, title: string, description: string }) => {
  return (
    <motion.div 
      className="relative"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-6xl font-bold text-primary/10 absolute -top-6 -left-2">{number}</div>
      <div className="pt-6 pl-4">
        <h3 className="text-xl font-medium mb-3">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
};

export default Index;
