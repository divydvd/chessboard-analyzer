
import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Clipboard, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasteImageProps {
  onImagePasted: (file: File) => void;
}

export function PasteImage({ onImagePasted }: PasteImageProps) {
  const [pasteStatus, setPasteStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handlePaste = useCallback((event: ClipboardEvent) => {
    const items = event.clipboardData?.items;
    
    if (!items) {
      setPasteStatus('error');
      setErrorMessage('No clipboard data found');
      return;
    }
    
    // Loop through all clipboard items
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        // Get the image as a file
        const file = items[i].getAsFile();
        if (file) {
          onImagePasted(file);
          setPasteStatus('success');
          return;
        }
      }
    }
    
    setPasteStatus('error');
    setErrorMessage('No image found in clipboard');
  }, [onImagePasted]);

  // Listen for paste events
  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  // Reset status after a delay
  useEffect(() => {
    if (pasteStatus !== 'idle') {
      const timer = setTimeout(() => {
        setPasteStatus('idle');
        setErrorMessage('');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [pasteStatus]);

  const focusOnDocument = () => {
    // Set focus to the document to capture the next paste event
    document.body.focus();
    
    // Clear any existing selection
    if (window.getSelection) {
      if (window.getSelection()?.empty) {
        window.getSelection()?.empty();
      } else if (window.getSelection()?.removeAllRanges) {
        window.getSelection()?.removeAllRanges();
      }
    }
  };

  return (
    <div 
      className={cn(
        "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all",
        pasteStatus === 'success' ? "border-green-500 bg-green-500/5" :
        pasteStatus === 'error' ? "border-destructive bg-destructive/5" :
        "border-muted hover:border-primary hover:bg-primary/5"
      )}
      onClick={focusOnDocument}
    >
      {pasteStatus === 'idle' && (
        <>
          <Clipboard className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-1">Paste Chess Image</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Copy an image and press Ctrl+V or Cmd+V
          </p>
          <Button variant="secondary" size="sm" onClick={focusOnDocument}>
            Click here and paste
          </Button>
        </>
      )}
      
      {pasteStatus === 'success' && (
        <>
          <CheckCircle2 className="h-8 w-8 mx-auto mb-3 text-green-500" />
          <h3 className="text-lg font-medium mb-1">Image Received!</h3>
          <p className="text-sm text-green-500 mb-2">
            Processing your chess image...
          </p>
        </>
      )}
      
      {pasteStatus === 'error' && (
        <>
          <AlertCircle className="h-8 w-8 mx-auto mb-3 text-destructive" />
          <h3 className="text-lg font-medium mb-1">Paste Error</h3>
          <p className="text-sm text-destructive mb-2">
            {errorMessage || 'Failed to paste image. Try copying the image again.'}
          </p>
          <Button variant="outline" size="sm" onClick={focusOnDocument}>
            Try Again
          </Button>
        </>
      )}
    </div>
  );
}
