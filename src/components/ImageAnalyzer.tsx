
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { analyzeChessImage, getApiConfig } from '@/utils/chessAnalyzer';
import { UploadArea } from '@/components/chess/UploadArea';
import { ProcessingState } from '@/components/chess/ProcessingState';
import { ErrorDisplay } from '@/components/chess/ErrorDisplay';
import { ResultsDisplay } from '@/components/chess/ResultsDisplay';

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
      const config = await getApiConfig();
      
      if (!config) {
        setError('API configuration is missing. Please set up your API key in settings.');
        toast({
          title: "Configuration Missing",
          description: "Please set up your API key in settings",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }
      
      const result = await analyzeChessImage(file, config);
      
      if (!result.success || !result.pgn) {
        if (result.error?.includes("quota") || result.error?.includes("exceeded")) {
          setError(`API Quota Exceeded: ${result.error}`);
          toast({
            title: "API Quota Error",
            description: "You've exceeded your API quota. Please check billing details.",
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

  const retry = () => {
    setError(null);
    setPgn(null);
  };

  return (
    <Card className="p-6 w-full max-w-md mx-auto">
      {!pgn && !isProcessing && !error && (
        <UploadArea onImageUploaded={processImage} />
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
