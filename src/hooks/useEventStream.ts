/**
 * @file useEventStream.ts
 * @description Elegant React streaming hook with immediate event processing
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { StreamEvent } from '@/utils/mergeMessage';

interface UseEventStreamOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

interface UseEventStreamResult {
  startStream: (onEvent: (event: StreamEvent) => void, requestBody?: string) => Promise<void>;
  stopStream: () => void;
  isStreaming: boolean;
  error: string | null;
}

/**
 * Simple SSE chunk parser - direct event processing
 */
function parseSSEChunk(chunk: string): StreamEvent[] {
  const events: StreamEvent[] = [];
  const lines = chunk.split('\n');
  
  let currentEvent: any = { data: null };
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine === '') {
      // Empty line indicates end of event
      if (currentEvent.data !== null) {
        events.push(currentEvent as StreamEvent);
        currentEvent = { data: null };
      }
      continue;
    }
    
    if (trimmedLine.startsWith('data: ')) {
      const dataStr = trimmedLine.slice(6);
      if (dataStr === '[DONE]') {
        break; // Stream completed
      }
      
      try {
        currentEvent.data = JSON.parse(dataStr);
      } catch (e) {
        // If not JSON, create a simple event
        currentEvent = {
          event: 'message_chunk',
          data: { content: dataStr }
        };
      }
    } else if (trimmedLine.startsWith('event: ')) {
      currentEvent.event = trimmedLine.slice(7);
    }
  }
  
  // Handle final event if no trailing newline
  if (currentEvent.data !== null) {
    events.push(currentEvent as StreamEvent);
  }
  
  return events;
}

export const useEventStream = (
  url: string, 
  options: UseEventStreamOptions = {}
): UseEventStreamResult => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const bufferRef = useRef<string>('');
  const { toast } = useToast();

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const startStream = useCallback(async (onEvent: (event: StreamEvent) => void, requestBody?: string) => {
    // Reset state for new stream
    setIsStreaming(true);
    setError(null);
    bufferRef.current = '';
    
    // Create fresh abort controller
    abortControllerRef.current = new AbortController();
    
    try {
      const response = await fetch(url, {
        method: options.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        body: requestBody || options.body,
        signal: abortControllerRef.current.signal
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      if (!response.body) {
        throw new Error('No response body available');
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        // Check for abort before each read
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }
        
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        // Decode chunk and add to buffer
        const chunk = decoder.decode(value, { stream: true });
        bufferRef.current += chunk;
        
        // Process complete lines from buffer
        const lines = bufferRef.current.split('\n\n');
        bufferRef.current = lines.pop() || ''; // Keep incomplete part in buffer
        
        // Parse and process events immediately
        for (const eventBlock of lines) {
          if (eventBlock.trim() && !abortControllerRef.current?.signal.aborted) {
            const events = parseSSEChunk(eventBlock + '\n\n');
            for (const event of events) {
              onEvent(event); // Direct callback - immediate processing
            }
          }
        }
      }
      
    } catch (err: any) {
      // Handle different error types appropriately
      if (err.name === 'AbortError') {
        // User-initiated abort - silent
        return;
      }
      
      const errorMessage = err.message || 'Unknown streaming error';
      setError(errorMessage);
      
      // Use platform's toast system for user feedback
      toast({
        title: "Streaming Error",
        description: errorMessage,
        variant: "destructive",
      });
      
    } finally {
      setIsStreaming(false);
      bufferRef.current = '';
    }
  }, [url, options.method, options.headers, toast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    startStream,
    stopStream,
    isStreaming,
    error
  };
};