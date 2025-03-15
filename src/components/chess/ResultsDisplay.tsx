
import React from 'react';
import { Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { openPGNOnLichess } from '@/utils/chessAnalyzer';

interface ResultsDisplayProps {
  pgn: string;
}

export function ResultsDisplay({ pgn }: ResultsDisplayProps) {
  const { toast } = useToast();

  const copyToClipboard = () => {
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
    try {
      openPGNOnLichess(pgn);
    } catch (err) {
      console.error('Failed to open Lichess:', err);
      toast({
        title: "Lichess Error",
        description: "Failed to open the position on Lichess. Try copying the PGN and importing manually.",
        variant: "destructive"
      });
    }
  };

  return (
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
          <li>Go to <a href="https://lichess.org/analysis" target="_blank" rel="noreferrer" className="text-primary hover:underline">lichess.org/analysis</a></li>
          <li>Use the import feature to paste the PGN</li>
        </ol>
      </div>
    </div>
  );
}
