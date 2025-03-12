
import React from 'react';
import { Loader2 } from 'lucide-react';

export function ProcessingState() {
  return (
    <div className="text-center py-8">
      <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-primary" />
      <h3 className="text-lg font-medium mb-1">Analyzing Chess Position</h3>
      <p className="text-sm text-muted-foreground">
        This may take a few moments...
      </p>
    </div>
  );
}
