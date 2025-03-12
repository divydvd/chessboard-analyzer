
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic URL validation
    setError('');
    
    if (!url.trim()) {
      setError('Please enter an image URL');
      return;
    }
    
    try {
      // Check if the URL is valid
      new URL(url);
      
      // Check if it's likely an image URL
      const lowerUrl = url.toLowerCase();
      const hasImageExtension = /\.(jpg|jpeg|png|gif|webp|bmp)(\?.*)?$/i.test(lowerUrl);
      
      if (!hasImageExtension) {
        // Still proceed but show a warning
        console.warn('URL might not be an image, but will try to process it anyway');
      }
      
      onImageUrlSubmitted(url);
    } catch (err) {
      setError('Please enter a valid URL');
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
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        
        <div className="flex justify-center">
          <Button type="submit" disabled={!url.trim()}>
            Analyze Image URL
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
