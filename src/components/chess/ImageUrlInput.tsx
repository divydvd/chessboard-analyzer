
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
      
      // Try a HEAD request to check if it's an image
      // First, ensure we're not hitting CORS issues
      setIsValidating(true);
      const response = await fetch(url, { method: 'HEAD' })
        .catch(() => {
          // If we hit CORS issues, we'll just proceed with the assumption it might be an image
          console.warn('Could not validate image URL due to CORS, will try to process anyway');
          return null;
        });
        
      setIsValidating(false);
      
      if (response) {
        const contentType = response.headers.get('content-type');
        if (contentType && !contentType.startsWith('image/')) {
          setError('URL does not point to an image. Please provide a direct image link.');
          return false;
        }
      }
      
      // Check if it looks like an image URL by extension
      const lowerUrl = url.toLowerCase();
      const hasImageExtension = /\.(jpg|jpeg|png|gif|webp|bmp)(\?.*)?$/i.test(lowerUrl);
      
      if (!hasImageExtension) {
        setError('URL might not be an image. Make sure it ends with .jpg, .png, etc.');
        // We'll still proceed but with a warning
        return true;
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
    
    const isValid = await validateImageUrl(url);
    
    if (isValid) {
      onImageUrlSubmitted(url);
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
        <p>We'll try to validate the link, but some image hosts may block validation requests.</p>
      </div>
    </div>
  );
}
