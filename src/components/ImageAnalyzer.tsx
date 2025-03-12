import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Copy, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyzeChessImage, openPGNOnLichess, getApiConfig, extractFENFromPGN } from '@/utils/chessAnalyzer';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';

export function ImageAnalyzer() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pgn, setPgn] = useState<string | null>(null);
  const { toast } = useToast();

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    
    await processImage(file);
  };
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': []
    },
    maxFiles: 1
  });

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

  const copyToClipboard = () => {
    if (!pgn) return;
    
    navigator.clipboard.writeText(pgn)
      .then(() => {
        toast({
          title: "Copied!",
          description: "PGN copied to clipboard"
        });
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        toast({
          title: "Copy Failed",
          description: "Failed to copy PGN to clipboard",
          variant: "destructive"
        });
      });
  };

  const analyzeOnLichess = () => {
    if (!pgn) return;
    
    try {
      openPGNOnLichess(pgn);
    } catch (err) {
      console.error('Failed to open Lichess:', err);
      
      // Extract FEN for manual fallback link
      const fen = extractFENFromPGN(pgn);
      
      if (fen) {
        // If we have a FEN, provide a direct link as fallback
        const encodedFEN = fen.replace(/\s+/g, '_');
        const lichessURL = `https://lichess.org/analysis/${encodedFEN}`;
        
        toast({
          title: "Automatic Opening Failed",
          description: (
            <div>
              <p>Failed to open Lichess automatically. Click <a href={lichessURL} target="_blank" rel="noreferrer" className="text-primary underline">here</a> to open manually.</p>
            </div>
          )
        });
      } else {
        toast({
          title: "Lichess Error",
          description: "Failed to open the position on Lichess. Try copying the PGN and importing manually.",
          variant: "destructive"
        });
      }
    }
  };

  const retry = () => {
    setError(null);
    setPgn(null);
  };

  return (
    <Card className="p-6 w-full max-w-md mx-auto">
      {!pgn && !isProcessing && !error && (
        <div 
          {...getRootProps()} 
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all",
            isDragActive ? "border-primary bg-primary/5" : "border-muted",
            "hover:border-primary hover:bg-primary/5"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-1">Upload Chess Image</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop or click to browse
          </p>
          <Button variant="secondary" size="sm">Browse Files</Button>
        </div>
      )}

      {isProcessing && (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-primary" />
          <h3 className="text-lg font-medium mb-1">Analyzing Chess Position</h3>
          <p className="text-sm text-muted-foreground">
            This may take a few moments...
          </p>
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <div className="h-8 w-8 mx-auto mb-3 rounded-full bg-destructive/20 flex items-center justify-center">
            <AlertCircle className="h-5 w-5 text-destructive" />
          </div>
          <h3 className="text-lg font-medium mb-1">Analysis Failed</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          
          {error.includes("API Quota Exceeded") || error.includes("exceeded your") ? (
            <div className="bg-muted rounded-lg p-4 text-left mb-4 text-sm">
              <p className="font-medium mb-2">How to fix this:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>For OpenAI: Add a payment method in your <a href="https://platform.openai.com/account/billing" target="_blank" rel="noreferrer" className="text-primary hover:underline">OpenAI billing settings</a></li>
                <li>For DeepSeek: Check your <a href="https://www.deepseek.com/" target="_blank" rel="noreferrer" className="text-primary hover:underline">DeepSeek account</a> for quota information</li>
                <li>Try switching to the other provider in the API Settings tab</li>
              </ul>
            </div>
          ) : null}
          
          <Button onClick={retry} variant="secondary" size="sm">Try Again</Button>
        </div>
      )}

      {pgn && (
        <div>
          <h3 className="text-lg font-medium mb-2">Analysis Result</h3>
          <div className="bg-muted rounded-lg p-3 mb-4 max-h-[200px] overflow-y-auto">
            <pre className="text-xs whitespace-pre-wrap">{pgn}</pre>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              <Copy className="h-4 w-4 mr-1" />
              Copy PGN
            </Button>
            <Button onClick={analyzeOnLichess}>
              <ExternalLink className="h-4 w-4 mr-1" />
              Analyze on Lichess
            </Button>
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            <p className="font-medium">Can't open on Lichess?</p>
            <ol className="list-decimal pl-5 mt-1">
              <li>Copy the PGN using the button above</li>
              <li>Go to <a href="https://lichess.org/paste" target="_blank" rel="noreferrer" className="text-primary hover:underline">lichess.org/paste</a></li>
              <li>Paste the PGN and click "Import"</li>
            </ol>
          </div>
        </div>
      )}
    </Card>
  );
}
