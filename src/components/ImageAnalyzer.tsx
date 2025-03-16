
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { analyzeChessImage } from '@/utils/chessAnalyzer';
import { UploadArea } from '@/components/chess/UploadArea';
import { ProcessingState } from '@/components/chess/ProcessingState';
import { ErrorDisplay } from '@/components/chess/ErrorDisplay';
import { ResultsDisplay } from '@/components/chess/ResultsDisplay';
import { ImageUrlInput } from '@/components/chess/ImageUrlInput';
import { PasteImage } from '@/components/chess/PasteImage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdBanner } from '@/components/ads/AdBanner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ImageAnalyzer() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pgn, setPgn] = useState<string | null>(null);
  const [adBlockerDetected, setAdBlockerDetected] = useState(false);
  const { toast } = useToast();

  const processImage = async (file: File) => {
    if (adBlockerDetected) {
      toast({
        title: "Ad Blocker Detected",
        description: "Please disable your ad blocker to use this feature",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    setPgn(null);
    
    try {
      console.log("Processing image file...");
      // Use the API key from the environment variables
      const result = await analyzeChessImage(file);
      
      if (!result.success || !result.pgn) {
        if (result.error?.includes("quota") || result.error?.includes("exceeded")) {
          setError(`API Quota Exceeded: ${result.error}`);
          toast({
            title: "API Quota Error",
            description: "You've exceeded your API quota. Please check our pricing plans.",
            variant: "destructive"
          });
        } else {
          setError(result.error || 'Failed to analyze the image');
          toast({
            title: "Analysis Failed",
            description: result.error || "Couldn't extract chess position from image",
            variant: "destructive"
          });
        }
      } else {
        console.log("Analysis succeeded with PGN:", result.pgn);
        setPgn(result.pgn);
        toast({
          title: "Analysis Complete",
          description: "Successfully extracted chess position"
        });
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
      toast({
        title: "Error",
        description: "An unexpected error occurred during analysis",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const processImageUrl = async (url: string) => {
    if (adBlockerDetected) {
      toast({
        title: "Ad Blocker Detected",
        description: "Please disable your ad blocker to use this feature",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    setPgn(null);
    
    try {
      console.log("Processing image URL:", url);
      // First, fetch the image from the URL
      try {
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        
        const blob = await response.blob();
        
        // Check if the response is an image
        if (!blob.type.startsWith('image/')) {
          throw new Error("The URL did not return a valid image");
        }
        
        // Convert blob to File object
        const file = new File([blob], "chess-image.jpg", { type: blob.type });
        
        // Process the image
        await processImage(file);
      } catch (fetchErr) {
        console.error('Error fetching or processing image URL:', fetchErr);
        setError(`Error with image URL: ${fetchErr instanceof Error ? fetchErr.message : String(fetchErr)}`);
        setIsProcessing(false);
        toast({
          title: "Invalid Image URL",
          description: "Please provide a valid direct link to a chess position image",
          variant: "destructive"
        });
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
      setIsProcessing(false);
      toast({
        title: "Error",
        description: "An unexpected error occurred during analysis",
        variant: "destructive"
      });
    }
  };

  const retry = () => {
    setError(null);
    setPgn(null);
  };

  const handleAdBlockDetected = () => {
    setAdBlockerDetected(true);
  };

  if (adBlockerDetected) {
    return (
      <Card className="p-6 w-full">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Ad Blocker Detected</AlertTitle>
          <AlertDescription>
            <p className="mb-4">We rely on advertisements to provide this service for free. Please disable your ad blocker and refresh the page to continue using ChessVision.</p>
            <Button 
              className="w-full"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Page
            </Button>
          </AlertDescription>
        </Alert>
      </Card>
    );
  }

  return (
    <Card className="p-6 w-full">
      <AdBanner position="top" className="w-full mb-6" onAdBlockDetected={handleAdBlockDetected} />
      
      {!pgn && !isProcessing && !error && (
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="upload">Upload Image</TabsTrigger>
            <TabsTrigger value="paste">Paste Image</TabsTrigger>
            <TabsTrigger value="url">Image URL</TabsTrigger>
          </TabsList>
          <TabsContent value="upload">
            <UploadArea onImageUploaded={processImage} />
          </TabsContent>
          <TabsContent value="paste">
            <PasteImage onImagePasted={processImage} />
          </TabsContent>
          <TabsContent value="url">
            <ImageUrlInput onImageUrlSubmitted={processImageUrl} />
          </TabsContent>
        </Tabs>
      )}

      {isProcessing && (
        <ProcessingState />
      )}

      {error && (
        <ErrorDisplay error={error} onRetry={retry} />
      )}

      {pgn && (
        <ResultsDisplay pgn={pgn} onReset={retry} />
      )}
      
      <AdBanner position="bottom" className="w-full max-w-md mt-10" onAdBlockDetected={handleAdBlockDetected} />
    </Card>
  );
}
