
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useOptimizedStreaming } from '@/hooks/useOptimizedStreaming';
import OptimizedStreamingOverlay from '@/components/assistant/OptimizedStreamingOverlay';

interface StreamingChatProps {
  className?: string;
  onStreamComplete?: (text: string, citations: any[]) => void;
}

const StreamingChat: React.FC<StreamingChatProps> = ({
  className,
  onStreamComplete
}) => {
  const {
    streamingState,
    processChunk,
    processCitations,
    completeStreaming,
    startStreaming,
    setError
  } = useOptimizedStreaming();

  const [isActive, setIsActive] = useState(false);

  // Demo function to simulate 450-character chunks
  const simulateStreaming = () => {
    startStreaming();
    setIsActive(true);

    const chunks = [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia",
      " deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem",
      " sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur."
    ];

    const citations = [
      { name: "Example Source 1", url: "https://example.com/1", type: "article" },
      { name: "Example Source 2", url: "https://example.com/2", type: "research" }
    ];

    // Simulate chunk delivery every 800ms
    chunks.forEach((chunk, index) => {
      setTimeout(() => {
        processChunk(chunk);
        
        if (index === 1) {
          // Add citations with second chunk
          processCitations(citations);
        }
        
        if (index === chunks.length - 1) {
          // Complete streaming after last chunk
          setTimeout(() => {
            completeStreaming();
            setIsActive(false);
            onStreamComplete?.(chunks.join(''), citations);
          }, 500);
        }
      }, (index + 1) * 800);
    });
  };

  return (
    <div className={cn("p-6 space-y-4", className)}>
      <div className="flex items-center gap-4">
        <button
          onClick={simulateStreaming}
          disabled={isActive}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
        >
          {isActive ? 'Streaming...' : 'Start Demo Stream'}
        </button>
        
        {streamingState.progress > 0 && (
          <span className="text-sm text-muted-foreground">
            Progress: {Math.round(streamingState.progress)}%
          </span>
        )}
      </div>

      {/* Streaming Overlay */}
      {(streamingState.isStreaming || streamingState.displayedText) && (
        <OptimizedStreamingOverlay 
          streamingState={{
            ...streamingState,
            finalCitations: streamingState.citations,
            hasContent: streamingState.displayedText.length > 0,
            rawText: streamingState.bufferedText,
            currentText: streamingState.displayedText
          } as any}
        />
      )}

      {/* Final Result */}
      {streamingState.isComplete && (
        <div className="mt-6 p-4 bg-background/50 rounded-lg border">
          <h3 className="font-semibold mb-2">Final Result:</h3>
          <p className="text-sm text-muted-foreground mb-2">
            {streamingState.displayedText}
          </p>
          {streamingState.citations.length > 0 && (
            <div className="mt-3">
              <h4 className="font-medium text-sm mb-1">Citations:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                {streamingState.citations.map((citation, index) => (
                  <li key={index}>
                    {citation.name} ({citation.type})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StreamingChat;
