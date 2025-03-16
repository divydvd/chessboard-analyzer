
import React from 'react';
import { cn } from '@/lib/utils';

interface AdBannerProps {
  position: 'top' | 'bottom' | 'sidebar';
  className?: string;
}

export function AdBanner({ position, className }: AdBannerProps) {
  return (
    <div 
      className={cn(
        "border border-border rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center",
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
