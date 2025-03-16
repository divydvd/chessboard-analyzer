
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface AdBannerProps {
  position: 'top' | 'bottom' | 'sidebar';
  className?: string;
  onAdBlockDetected?: () => void;
}

export function AdBanner({ position, className, onAdBlockDetected }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const [isAdBlockerDetected, setIsAdBlockerDetected] = useState(false);

  useEffect(() => {
    const detectAdBlocker = () => {
      // Check if the ad element has been hidden by an ad blocker
      if (adRef.current) {
        const elemHeight = adRef.current.offsetHeight;
        const elemWidth = adRef.current.offsetWidth;
        const computedStyle = window.getComputedStyle(adRef.current);
        const isHidden = 
          computedStyle.display === 'none' || 
          computedStyle.visibility === 'hidden' ||
          computedStyle.opacity === '0' ||
          elemHeight === 0;

        if (isHidden) {
          setIsAdBlockerDetected(true);
          if (onAdBlockDetected) {
            onAdBlockDetected();
          }
        }
      }
    };

    // Add a bait class that ad blockers tend to target
    const baitElement = document.createElement('div');
    baitElement.className = 'ad-banner-bait';
    baitElement.style.height = '1px';
    baitElement.style.width = '1px';
    baitElement.style.position = 'absolute';
    baitElement.style.bottom = '0';
    baitElement.style.left = '0';
    document.body.appendChild(baitElement);

    // Check after a short delay to allow ad blockers to act
    const timer = setTimeout(() => {
      detectAdBlocker();
      
      // Also check if our bait element was affected
      const baitComputedStyle = window.getComputedStyle(baitElement);
      if (baitComputedStyle.display === 'none' || 
          baitComputedStyle.visibility === 'hidden' || 
          baitComputedStyle.opacity === '0' ||
          !document.querySelector('.ad-banner-bait')) {
        setIsAdBlockerDetected(true);
        if (onAdBlockDetected) {
          onAdBlockDetected();
        }
      }
      
      // Clean up the bait element
      if (document.body.contains(baitElement)) {
        document.body.removeChild(baitElement);
      }
    }, 500);
    
    return () => {
      clearTimeout(timer);
      if (document.body.contains(baitElement)) {
        document.body.removeChild(baitElement);
      }
    };
  }, [onAdBlockDetected]);

  if (isAdBlockerDetected) {
    return (
      <Alert variant="destructive" className="my-4">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Ad Blocker Detected</AlertTitle>
        <AlertDescription>
          We rely on advertisements to keep this service free. Please disable your ad blocker and refresh the page to continue.
          <Button 
            variant="outline" 
            className="mt-2 w-full" 
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Page
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div 
      ref={adRef}
      className={cn(
        "ad-banner border border-border rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center",
        position === 'top' ? 'h-24' : position === 'bottom' ? 'h-32' : 'h-full w-full',
        className
      )}
    >
      <div className="text-center px-4">
        <p className="text-muted-foreground text-sm">Advertisement</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          {position === 'top' ? '728×90 Banner' : position === 'bottom' ? '300×250 Rectangle' : 'Sidebar Ad'}
        </p>
      </div>
    </div>
  );
}
