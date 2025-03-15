
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link2 } from 'lucide-react';

interface ImageUrlInputProps {
  onImageUrlSubmitted: (url: string) => void;
}

export function ImageUrlInput({ onImageUrlSubmitted }: ImageUrlInputProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const validateImageUrl = async (url: string): Promise<boolean> => {
    try {
      // Check if the URL is valid
      new URL(url);
      
      // We'll bypass the HEAD request validation which can cause CORS issues
      // Just do a basic check for image file extension
      const lowerUrl = url.toLowerCase();
      const hasImageExtension = /\.(jpg|jpeg|png|gif|webp|bmp)(\?.*)?$/i.test(lowerUrl);
      
      if (!hasImageExtension) {
        // Just warn but still proceed
        console.warn('URL might not be an image, but proceeding anyway');
      }
      
      setError('');
      return true;
    } catch (err) {
      setError('Please enter a valid URL');
      setIsValidating(false);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic URL validation
    setError('');
    
    if (!url.trim()) {
      setError('Please enter an image URL');
      return;
    }
    
    // Set validating state during the process
    setIsValidating(true);
    
    try {
      const isValid = await validateImageUrl(url);
      
      if (isValid) {
        onImageUrlSubmitted(url);
      }
    } catch (error) {
      console.error('Error during URL validation:', error);
      setError('An error occurred while validating the URL');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center">
            <Link2 className="h-5 w-5 mr-2 text-muted-foreground" />
            <label htmlFor="image-url" className="text-sm font-medium">
              Chess Image URL
            </label>
          </div>
          <Input
            id="image-url"
            type="text"
            placeholder="https://example.com/chess-position.jpg"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={error ? "border-destructive" : ""}
            disabled={isValidating}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        
        <div className="flex justify-center">
          <Button type="submit" disabled={!url.trim() || isValidating}>
            {isValidating ? 'Validating...' : 'Analyze Image URL'}
          </Button>
        </div>
      </form>
      
      <div className="mt-4 text-xs text-muted-foreground">
        <p>Paste a direct link to a chess position image.</p>
        <p>The URL should point directly to an image file (JPG, PNG, etc).</p>
      </div>
    </div>
  );
}
