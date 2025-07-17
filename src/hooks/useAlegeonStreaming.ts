
import { useState, useCallback, useRef, useEffect } from 'react';
import { detectAlgeonResearchType, type AlgeonResearchType } from '@/utils/algeonResearchTypes';
import { useOptimizedStreaming } from './useOptimizedStreaming';

// Configuration constants
const STREAMING_TIMEOUT_MS = 300000; // 5 minutes
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

interface AlegeonStreamingEvent {
  type: string;
  content?: string;
  is_complete?: boolean;
  finish_reason?: string | null;
  citations?: Array<{
    name: string;
    url: string;
    type?: string;
  }>;
  usage?: object;
  error?: string | null;
  message?: string;
}

export interface AlegeonStreamingState {
  isStreaming: boolean;
  displayedText: string;
  bufferedText: string;
  citations: Array<{
    name: string;
    url: string;
    type?: string;
  }>;
  error: string | null;
  isComplete: boolean;
  progress: number;
  finalCitations: Array<{
    name: string;
    url: string;
    type?: string;
  }>;
  hasContent: boolean;
}

export const useAlegeonStreaming = () => {
  const {
    streamingState,
    processChunk,
    processCitations,
    completeStreaming,
    startStreaming,
    setError,
    reset
  } = useOptimizedStreaming();

  const wsRef = useRef<WebSocket | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const heartbeatRef = useRef<number | null>(null);
  const promiseRef = useRef<{
    resolve: (value: { text: string; citations: Array<{ name: string; url: string; type?: string }> }) => void;
    reject: (reason?: any) => void;
  } | null>(null);
  const hasResolvedRef = useRef<boolean>(false);
  const requestCompletedRef = useRef<boolean>(false); // Track request completion

  // Transform optimized state to legacy format for compatibility
  const alegeonStreamingState: AlegeonStreamingState = {
    ...streamingState,
    finalCitations: streamingState.citations,
    hasContent: streamingState.displayedText.length > 0 || streamingState.bufferedText.length > 0,
    // Keep the raw buffered text available
    rawText: streamingState.bufferedText,
    currentText: streamingState.displayedText
  } as any;

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.onclose = null;
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }
    hasResolvedRef.current = false;
    promiseRef.current = null;
  }, []);

  const resetState = useCallback(() => {
    console.log('🔄 Resetting Algeon streaming state');
    cleanup();
    reset(); // Use the new reset method
    requestCompletedRef.current = false; // Reset completion flag
  }, [cleanup, reset]);

  const startStreamingRequest = useCallback(async (query: string, researchType?: AlgeonResearchType): Promise<{ text: string; citations: Array<{ name: string; url: string; type?: string }> }> => {
    const detectedType = researchType || detectAlgeonResearchType(query);
    
    console.log('🚀 Starting Algeon streaming request for:', query.substring(0, 50));
    
    resetState();
    startStreaming();

    return new Promise((resolve, reject) => {
      promiseRef.current = { resolve, reject };
      hasResolvedRef.current = false;
      requestCompletedRef.current = false;

      // Set overall timeout
      timeoutRef.current = window.setTimeout(() => {
        if (!hasResolvedRef.current) {
          hasResolvedRef.current = true;
          const finalText = streamingState.bufferedText || streamingState.displayedText;
          const finalCitations = streamingState.citations;
          if (finalText) {
            resolve({ text: finalText, citations: finalCitations });
          } else {
            reject(new Error('Streaming timeout - research taking longer than expected'));
          }
          cleanup();
        }
      }, STREAMING_TIMEOUT_MS);

      try {
        const wsUrl = 'wss://opti-agent3-wrappers.up.railway.app/api/research/stream';
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          heartbeatRef.current = window.setInterval(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ type: 'ping' }));
            }
          }, HEARTBEAT_INTERVAL);
          
          const payload = {
            query: query,
            research_type: detectedType,
            scope: "global",
            depth: "executive_summary", 
            urgency: "medium",
            stream: true
          };
          
          wsRef.current.send(JSON.stringify(payload));
        };

        wsRef.current.onmessage = (event) => {
          try {
            const data: AlegeonStreamingEvent = JSON.parse(event.data);
            
            if (data.type === 'chunk') {
              // Process 450-character chunks efficiently
              if (data.content) {
                processChunk(data.content);
              }

              // Handle citations
              if (data.citations && data.citations.length > 0) {
                processCitations(data.citations);
              }
              
              // Check for completion - prevent duplicate handling
              if (data.is_complete === true && !requestCompletedRef.current) {
                console.log('✅ Algeon request completed');
                requestCompletedRef.current = true;
                
                if (!hasResolvedRef.current) {
                  hasResolvedRef.current = true;
                  
                  const finalCitations = data.citations || streamingState.citations;
                  const finalText = streamingState.bufferedText || streamingState.displayedText;
                  
                  completeStreaming();
                  
                  // Reset state after a delay to prevent interference
                  setTimeout(() => {
                    reset();
                  }, 1000);
                  
                  resolve({ text: finalText, citations: finalCitations });
                  cleanup();
                }
              }
            } else if (data.error) {
              if (!hasResolvedRef.current) {
                hasResolvedRef.current = true;
                setError(data.error || 'An error occurred during research');
                reject(new Error(data.error || 'Research failed'));
                cleanup();
              }
            }
            
          } catch (parseError) {
            console.error('Error parsing WebSocket message:', parseError);
          }
        };

        wsRef.current.onerror = (error) => {
          if (!hasResolvedRef.current) {
            hasResolvedRef.current = true;
            setError('WebSocket connection failed.');
            reject(new Error('WebSocket connection failed'));
            cleanup();
          }
        };

        wsRef.current.onclose = (event) => {
          if (!hasResolvedRef.current) {
            hasResolvedRef.current = true;
            const finalText = streamingState.bufferedText || streamingState.displayedText;
            const finalCitations = streamingState.citations;
            
            if (finalText && finalText.length > 50 && (event.code === 1000 || event.wasClean)) {
              completeStreaming();
              
              // Reset state after completion
              setTimeout(() => {
                reset();
              }, 1000);
              
              resolve({ text: finalText, citations: finalCitations });
            } else if (event.code === 1006) {
              reject(new Error('Connection lost unexpectedly'));
            } else {
              reject(new Error(`WebSocket closed unexpectedly: ${event.code} ${event.reason || 'No reason given'}`));
            }
            
            cleanup();
          }
        };

      } catch (error) {
        if (!hasResolvedRef.current) {
          hasResolvedRef.current = true;
          reject(error);
          cleanup();
        }
      }
    });
  }, [streamingState, processChunk, processCitations, completeStreaming, startStreaming, setError, resetState, cleanup, reset]);

  const stopStreaming = useCallback(() => {
    if (!hasResolvedRef.current && promiseRef.current) {
      hasResolvedRef.current = true;
      promiseRef.current.reject(new Error('Streaming stopped by user.'));
    }
    cleanup();
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStreaming();
    };
  }, [stopStreaming]);

  return {
    streamingState: alegeonStreamingState,
    startStreaming: startStreamingRequest,
    stopStreaming,
    resetState
  };
};
