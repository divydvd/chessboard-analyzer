
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { analyzeChessImage } from '@/utils/chessAnalyzer';
import { UploadArea } from '@/components/chess/UploadArea';
import { ProcessingState } from '@/components/chess/ProcessingState';
import { ErrorDisplay } from '@/components/chess/ErrorDisplay';
import { ResultsDisplay } from '@/components/chess/ResultsDisplay';
import { ImageUrlInput } from '@/components/chess/ImageUrlInput';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ImageAnalyzer() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pgn, setPgn] = useState<string | null>(null);
  const { toast } = useToast();

  const processImage = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setPgn(null);
    
    try {
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
    setIsProcessing(true);
    setError(null);
    setPgn(null);
    
    try {
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
          setPgn(result.pgn);
          toast({
            title: "Analysis Complete",
            description: "Successfully extracted chess position"
          });
        }
      } catch (fetchErr) {
        console.error('Error fetching or processing image URL:', fetchErr);
        setError(`Error with image URL: ${fetchErr instanceof Error ? fetchErr.message : String(fetchErr)}`);
        toast({
          title: "Invalid Image URL",
          description: "Please provide a valid direct link to a chess position image",
          variant: "destructive"
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

  const retry = () => {
    setError(null);
    setPgn(null);
  };

  return (
    <Card className="p-6 w-full">
      {!pgn && !isProcessing && !error && (
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="upload">Upload Image</TabsTrigger>
            <TabsTrigger value="url">Image URL</TabsTrigger>
          </TabsList>
          <TabsContent value="upload">
            <UploadArea onImageUploaded={processImage} />
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
        <ResultsDisplay pgn={pgn} />
      )}
    </Card>
  );
}
