
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
  sources?: Array<{
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
  hasContent: boolean;
}

export const useAlegeonStreaming = () => {
  const {
    streamingState,
    processChunk,
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
  const requestCompletedRef = useRef<boolean>(false);
  const finalCitationsRef = useRef<Array<{ name: string; url: string; type?: string }>>([]);

  // Transform optimized state to legacy format for compatibility
  const alegeonStreamingState: AlegeonStreamingState = {
    ...streamingState,
    citations: finalCitationsRef.current, // Only use final citations from is_complete=true chunk
    hasContent: streamingState.displayedText.length > 0 || streamingState.bufferedText.length > 0
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
    reset();
    requestCompletedRef.current = false;
    finalCitationsRef.current = [];
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
      finalCitationsRef.current = [];

      // Set overall timeout
      timeoutRef.current = window.setTimeout(() => {
        if (!hasResolvedRef.current) {
          hasResolvedRef.current = true;
          const finalText = streamingState.bufferedText || streamingState.displayedText;
          if (finalText) {
            resolve({ text: finalText, citations: finalCitationsRef.current });
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
              // Process text content normally during streaming
              if (data.content) {
                processChunk(data.content);
              }
              
              // Enhanced citation capture: Only when stream is complete with is_complete=true
              if (data.is_complete === true && !requestCompletedRef.current) {
                console.log('✅ Algeon request completed with final chunk containing citations');
                console.log('📋 Raw citations from final chunk:', data.citations);
                console.log('📋 Raw sources from final chunk:', data.sources);
                
                requestCompletedRef.current = true;
                
                // Enhanced citation processing: Handle both citations and sources fields
                const rawCitations = data.citations || [];
                const rawSources = data.sources || [];
                
                // Combine and normalize citations with proper name and URL extraction
                const allSources = [...rawCitations, ...rawSources];
                const processedCitations = allSources
                  .filter(source => source && (source.name || source.url)) // Ensure we have name or URL
                  .map(source => ({
                    name: source.name || 'Source', // Fallback name if missing
                    url: source.url || '#', // Fallback URL if missing
                    type: source.type || 'reference'
                  }));
                
                console.log('🔗 Processed final citations:', processedCitations);
                finalCitationsRef.current = processedCitations;
                
                if (!hasResolvedRef.current) {
                  hasResolvedRef.current = true;
                  
                  const finalText = streamingState.bufferedText || streamingState.displayedText;
                  
                  completeStreaming();
                  
                  console.log('✅ Resolving with final text and citations:', {
                    textLength: finalText.length,
                    citationsCount: processedCitations.length
                  });
                  
                  resolve({ text: finalText, citations: processedCitations });
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
            
            if (finalText && finalText.length > 50 && (event.code === 1000 || event.wasClean)) {
              completeStreaming();
              console.log('🔌 WebSocket closed cleanly, resolving with existing citations:', finalCitationsRef.current.length);
              resolve({ text: finalText, citations: finalCitationsRef.current });
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
  }, [streamingState, processChunk, completeStreaming, startStreaming, setError, resetState, cleanup, reset]);

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
