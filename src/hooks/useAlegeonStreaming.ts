
import { useState, useCallback, useRef, useEffect } from 'react';
import { useOptimizedStreaming } from './useOptimizedStreaming';
import type { AlgeonResearchType } from '@/utils/algeonResearchTypes';

// Configuration constants - Updated to 12 minutes
const STREAMING_TIMEOUT_MS = 720000; // 12 minutes
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

// Valid research types for validation
const VALID_RESEARCH_TYPES: AlgeonResearchType[] = [
  'quick_facts',
  'market_sizing', 
  'competitive_analysis',
  'regulatory_scan',
  'trend_analysis',
  'legal_analysis',
  'deep_analysis',
  'industry_reports'
];

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
  finalCitations: Array<{
    name: string;
    url: string;
    type?: string;
  }>;
  hasContent: boolean;
  currentPhaseMessage: string;
  phaseStartTime: number;
  // Enhanced thinking support
  thinkingPhase: import('@/utils/thinkingParser').ThinkingPhase;
  isThinkingActive: boolean;
}

// Utility function to validate and normalize research type
const validateResearchType = (type?: string): AlgeonResearchType => {
  if (!type) {
    console.log('🔬 No research type provided, defaulting to quick_facts');
    return 'quick_facts';
  }
  
  if (VALID_RESEARCH_TYPES.includes(type as AlgeonResearchType)) {
    console.log('🔬 Valid research type provided:', type);
    return type as AlgeonResearchType;
  }
  
  console.warn('🔬 Invalid research type provided:', type, 'defaulting to quick_facts');
  return 'quick_facts';
};

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
  const requestCompletedRef = useRef<boolean>(false);
  const messageCountRef = useRef<number>(0); // Track message count
  const requestIdRef = useRef<string>(''); // Track request ID

  // Transform optimized state to legacy format for compatibility
  const alegeonStreamingState: AlegeonStreamingState = {
    ...streamingState,
    finalCitations: streamingState.citations,
    hasContent: streamingState.displayedText.length > 0 || streamingState.bufferedText.length > 0,
    // Enhanced thinking support
    thinkingPhase: streamingState.thinkingPhase,
    isThinkingActive: streamingState.isThinkingActive,
    // Keep the raw buffered text available
    rawText: streamingState.bufferedText,
    currentText: streamingState.displayedText
  } as any;

  const cleanup = useCallback(() => {
    console.log('🧹 Cleaning up WebSocket connection and timers');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    if (wsRef.current) {
      console.log('🔌 Closing WebSocket connection, readyState:', wsRef.current.readyState);
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
    messageCountRef.current = 0;
  }, []);

  const resetState = useCallback(() => {
    console.log('🔄 Resetting Algeon streaming state');
    cleanup();
    reset();
    requestCompletedRef.current = false;
    messageCountRef.current = 0;
  }, [cleanup, reset]);

  const startStreamingRequest = useCallback(async (query: string, researchType?: string): Promise<{ text: string; citations: Array<{ name: string; url: string; type?: string }> }> => {
    // Generate unique request ID for tracking
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    requestIdRef.current = requestId;
    
    // Validate and normalize research type
    const validatedType = validateResearchType(researchType);
    
    console.log('🚀 Starting Algeon streaming request:', {
      requestId,
      query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
      researchType: researchType,
      validatedType,
      timeout: '12 minutes'
    });
    
    resetState();
    startStreaming();

    return new Promise((resolve, reject) => {
      promiseRef.current = { resolve, reject };
      hasResolvedRef.current = false;
      requestCompletedRef.current = false;
      messageCountRef.current = 0;

      // Set overall timeout to 12 minutes
      timeoutRef.current = window.setTimeout(() => {
        console.log('⏰ Request timeout reached after 12 minutes', { requestId, messageCount: messageCountRef.current });
        if (!hasResolvedRef.current) {
          hasResolvedRef.current = true;
          const finalText = streamingState.bufferedText || streamingState.displayedText;
          const finalCitations = streamingState.citations;
          if (finalText && finalText.trim().length > 20) {
            console.log('✅ Resolving with partial content due to timeout', { requestId, textLength: finalText.length });
            resolve({ text: finalText, citations: finalCitations });
          } else {
            console.error('❌ Timeout with no meaningful content', { requestId, textLength: finalText?.length || 0 });
            reject(new Error('Research session timeout - taking longer than 12 minutes with no meaningful content'));
          }
          cleanup();
        }
      }, STREAMING_TIMEOUT_MS);

      // Add diagnostic timeout warnings
      const diagnosticTimeouts = [30000, 60000, 120000]; // 30s, 1min, 2min
      diagnosticTimeouts.forEach((timeout, index) => {
        setTimeout(() => {
          if (!hasResolvedRef.current && messageCountRef.current === 0) {
            console.warn(`⚠️ Diagnostic: No messages received after ${timeout/1000}s`, { requestId });
          }
        }, timeout);
      });

      try {
        const wsUrl = 'wss://opti-agent3-wrappers.up.railway.app/api/research/stream';
        console.log('🔗 Creating WebSocket connection to:', wsUrl, { requestId });
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          console.log('✅ WebSocket connection opened successfully', { requestId });
          
          heartbeatRef.current = window.setInterval(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              console.log('💓 Sending heartbeat ping', { requestId });
              wsRef.current.send(JSON.stringify({ type: 'ping' }));
            }
          }, HEARTBEAT_INTERVAL);
          
          const payload = {
            query: query,
            research_type: validatedType,
            scope: "global",
            depth: "executive_summary", 
            urgency: "medium",
            stream: true
          };
          
          console.log('📤 Sending WebSocket payload:', { ...payload, requestId });
          wsRef.current.send(JSON.stringify(payload));
        };

        wsRef.current.onmessage = (event) => {
          messageCountRef.current++;
          console.log('📨 WebSocket message received:', { 
            requestId, 
            messageCount: messageCountRef.current,
            dataLength: event.data?.length || 0,
            rawData: event.data?.substring(0, 200) + (event.data?.length > 200 ? '...' : '')
          });

          try {
            const data: AlegeonStreamingEvent = JSON.parse(event.data);
            console.log('✅ Successfully parsed WebSocket message:', { 
              requestId,
              messageCount: messageCountRef.current,
              type: data.type,
              hasContent: !!data.content,
              contentLength: data.content?.length || 0,
              isComplete: data.is_complete,
              hasCitations: !!data.citations?.length,
              hasError: !!data.error
            });
            
            if (data.type === 'chunk') {
              // Process content chunks
              if (data.content) {
                console.log('📝 Processing content chunk:', { 
                  requestId,
                  contentLength: data.content.length,
                  contentPreview: data.content.substring(0, 50) + (data.content.length > 50 ? '...' : '')
                });
                processChunk(data.content);
              } else {
                console.log('⚠️ Chunk message with no content', { requestId, data });
              }

              // Handle citations
              if (data.citations && data.citations.length > 0) {
                console.log('📚 Processing citations:', { 
                  requestId,
                  citationCount: data.citations.length,
                  citations: data.citations.map(c => ({ name: c.name, url: c.url }))
                });
                processCitations(data.citations);
              }
              
              // Check for completion - prevent duplicate handling
              if (data.is_complete === true && !requestCompletedRef.current) {
                console.log('✅ Algeon request completed', { requestId, messageCount: messageCountRef.current });
                requestCompletedRef.current = true;
                
                if (!hasResolvedRef.current) {
                  hasResolvedRef.current = true;
                  
                  const finalCitations = data.citations || data.sources || streamingState.citations;
                  const finalText = streamingState.bufferedText || streamingState.displayedText;
                  
                  console.log('🎯 Resolving with final content:', { 
                    requestId,
                    textLength: finalText.length,
                    citationCount: finalCitations.length
                  });
                  
                  completeStreaming();
                  
                  // Reset state after a delay to prevent interference
                  setTimeout(() => {
                    reset();
                  }, 1000);
                  
                  resolve({ text: finalText, citations: finalCitations });
                  cleanup();
                }
              }
            } else if (data.type === 'ping') {
              console.log('💓 Received pong response', { requestId });
            } else if (data.error) {
              console.error('❌ WebSocket error message:', { requestId, error: data.error, message: data.message });
              if (!hasResolvedRef.current) {
                hasResolvedRef.current = true;
                const errorMsg = data.error || data.message || 'An error occurred during research';
                setError(errorMsg);
                reject(new Error(errorMsg));
                cleanup();
              }
            } else {
              console.log('ℹ️ Unknown message type:', { requestId, type: data.type, data });
            }
            
          } catch (parseError) {
            console.error('❌ Error parsing WebSocket message:', { 
              requestId,
              parseError: parseError.message,
              rawData: event.data?.substring(0, 500)
            });
            // Don't reject on parse errors, as the backend might send non-JSON data
          }
        };

        wsRef.current.onerror = (error) => {
          console.error('❌ WebSocket error event:', { requestId, error, readyState: wsRef.current?.readyState });
          if (!hasResolvedRef.current) {
            hasResolvedRef.current = true;
            setError('WebSocket connection failed - please check your internet connection');
            reject(new Error('WebSocket connection failed'));
            cleanup();
          }
        };

        wsRef.current.onclose = (event) => {
          console.log('🔌 WebSocket connection closed:', { 
            requestId,
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
            messageCount: messageCountRef.current,
            hasResolved: hasResolvedRef.current
          });
          
          if (!hasResolvedRef.current) {
            hasResolvedRef.current = true;
            const finalText = streamingState.bufferedText || streamingState.displayedText;
            const finalCitations = streamingState.citations;
            
            // Handle different close scenarios
            if (finalText && finalText.trim().length > 50 && (event.code === 1000 || event.wasClean)) {
              console.log('✅ Clean close with content, resolving', { 
                requestId,
                textLength: finalText.length,
                closeCode: event.code
              });
              completeStreaming();
              
              setTimeout(() => {
                reset();
              }, 1000);
              
              resolve({ text: finalText, citations: finalCitations });
            } else if (event.code === 1006) {
              console.error('❌ Connection lost unexpectedly (1006)', { requestId });
              setError('Connection lost unexpectedly - the research service may be temporarily unavailable');
              reject(new Error('Connection lost unexpectedly'));
            } else if (messageCountRef.current === 0) {
              console.error('❌ No messages received before close', { requestId, closeCode: event.code });
              setError('No response from research service - please try again');
              reject(new Error('No response from research service'));
            } else {
              console.error('❌ Unexpected close without sufficient content', { 
                requestId,
                closeCode: event.code,
                reason: event.reason,
                textLength: finalText?.length || 0
              });
              setError(`Research service closed connection unexpectedly (${event.code})`);
              reject(new Error(`WebSocket closed unexpectedly: ${event.code} ${event.reason || 'No reason given'}`));
            }
            
            cleanup();
          }
        };

      } catch (error) {
        console.error('❌ Error creating WebSocket:', { requestId, error });
        if (!hasResolvedRef.current) {
          hasResolvedRef.current = true;
          setError('Failed to establish connection to research service');
          reject(error);
          cleanup();
        }
      }
    });
  }, [streamingState, processChunk, processCitations, completeStreaming, startStreaming, setError, resetState, cleanup, reset]);

  const stopStreaming = useCallback(() => {
    console.log('🛑 Stopping streaming manually', { requestId: requestIdRef.current });
    if (!hasResolvedRef.current && promiseRef.current) {
      hasResolvedRef.current = true;
      promiseRef.current.reject(new Error('Streaming stopped by user.'));
    }
    cleanup();
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Component unmounting, cleaning up');
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
