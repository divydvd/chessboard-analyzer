
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorDisplayProps {
  error: string;
  onRetry: () => void;
}

export function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  const isQuotaError = error.includes("API Quota Exceeded") || error.includes("exceeded your");

  return (
    <div className="text-center py-8">
      <div className="h-8 w-8 mx-auto mb-3 rounded-full bg-destructive/20 flex items-center justify-center">
        <AlertCircle className="h-5 w-5 text-destructive" />
      </div>
      <h3 className="text-lg font-medium mb-1">Analysis Failed</h3>
      <p className="text-sm text-muted-foreground mb-4">{error}</p>
      
      {isQuotaError ? (
        <div className="bg-muted rounded-lg p-4 text-left mb-4 text-sm">
          <p className="font-medium mb-2">How to fix this:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>For OpenAI: Add a payment method in your <a href="https://platform.openai.com/account/billing" target="_blank" rel="noreferrer" className="text-primary hover:underline">OpenAI billing settings</a></li>
            <li>For DeepSeek: Check your <a href="https://www.deepseek.com/" target="_blank" rel="noreferrer" className="text-primary hover:underline">DeepSeek account</a> for quota information</li>
            <li>Try switching to the other provider in the API Settings tab</li>
          </ul>
        </div>
      ) : null}
      
      <Button onClick={onRetry} variant="secondary" size="sm">Try Again</Button>
    </div>
  );
}
