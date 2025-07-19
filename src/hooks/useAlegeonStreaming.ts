import { useState, useCallback, useRef, useEffect } from 'react';
import { detectAlgeonResearchType, type AlgeonResearchType } from '@/utils/algeonResearchTypes';
import { ThinkingParser, type ThinkingState } from '@/utils/thinkingParser';
import { useReasoning } from '@/contexts/ReasoningContext';
import { useOptimizedStreaming } from './useOptimizedStreaming';

// Configuration constants - Updated to 12 minutes
const STREAMING_TIMEOUT_MS = 720000; // 12 minutes
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
  finalCitations: Array<{
    name: string;
    url: string;
    type?: string;
  }>;
  hasContent: boolean;
  currentPhaseMessage: string;
  phaseStartTime: number;
}

export const useAlegeonStreaming = (messageId: string | null) => {
  const [streamingState, setStreamingState] = useState<AlegeonStreamingState>({
    isStreaming: false,
    displayedText: '',
    bufferedText: '',
    citations: [],
    error: null,
    isComplete: false,
    progress: 0,
    finalCitations: [],
    hasContent: false,
    currentPhaseMessage: '',
    phaseStartTime: Date.now(),
  });

  const { setThinkingState } = useReasoning();
  const thinkingParserRef = useRef(new ThinkingParser());

  const wsRef = useRef<WebSocket | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const heartbeatRef = useRef<number | null>(null);
  const promiseRef = useRef<{
    resolve: (value: string) => void;
    reject: (reason?: any) => void;
  } | null>(null);
  const hasResolvedRef = useRef<boolean>(false);
  const requestCompletedRef = useRef<boolean>(false); // Track request completion

  // Transform optimized state to legacy format for compatibility
  const alegeonStreamingState: AlegeonStreamingState = {
    ...streamingState,
    finalCitations: streamingState.citations,
    hasContent: streamingState.displayedText.length > 0 || streamingState.bufferedText.length > 0
  };

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
    setStreamingState({
      isStreaming: false,
      displayedText: '',
      bufferedText: '',
      citations: [],
      error: null,
      isComplete: false,
      progress: 0,
      finalCitations: [],
      hasContent: false,
      currentPhaseMessage: '',
      phaseStartTime: Date.now(),
    });
    thinkingParserRef.current.reset();
    setThinkingState(null);
    cleanup();
  }, [cleanup, setThinkingState]);

  const startStreaming = useCallback(async (query: string, researchType?: AlgeonResearchType): Promise<string> => {
    // Use manually selected research type or default to 'quick_facts'
    const selectedType = researchType || 'quick_facts';
    
    console.log('🚀 Starting Algeon streaming request for:', query.substring(0, 50));
    console.log('🔬 Research Type Selected:', selectedType);
    console.log('⏱️ Session timeout set to 12 minutes');
    
    resetState();
    setStreamingState(prev => ({ ...prev, isStreaming: true }));

    return new Promise((resolve, reject) => {
      promiseRef.current = { resolve, reject };
      hasResolvedRef.current = false;
      requestCompletedRef.current = false;

      // Set overall timeout to 12 minutes
      timeoutRef.current = window.setTimeout(() => {
        if (!hasResolvedRef.current) {
          hasResolvedRef.current = true;
          const finalText = streamingState.bufferedText || streamingState.displayedText;
          const finalCitations = streamingState.citations;
            if (finalText) {
              resolve(finalText);
            } else {
              reject(new Error('Research session timeout - taking longer than 12 minutes'));
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
            research_type: selectedType,
            scope: "global",
            depth: "executive_summary", 
            urgency: "medium",
            stream: true
          };
          
          console.log('📤 Sending WebSocket payload:', payload);
          wsRef.current.send(JSON.stringify(payload));
        };

        let hasReceivedContent = false;

        wsRef.current.onmessage = (event) => {
          // Enhanced debugging
          console.log('🟦 RAW WebSocket message received:', event.data);
          
          try {
            const data: AlegeonStreamingEvent = JSON.parse(event.data);
            thinkingParserRef.current.parse(data.content || '');
            const currentThinkingState = thinkingParserRef.current.getState();
            setThinkingState(currentThinkingState);
            
            setStreamingState(prev => {
              const newState = { ...prev };
              
              // Handle different event types more flexibly
              switch (data.type) {
                case 'chunk':
                  if (data.content) {
                    hasReceivedContent = true;
                    newState.bufferedText = currentThinkingState.finalContent;
                    console.log('📝 Content chunk added, total length:', newState.bufferedText.length);
                  }
                  break;
                case 'complete':
                  if (!requestCompletedRef.current) {
                    requestCompletedRef.current = true;
                    newState.isComplete = true;
                    newState.displayedText = currentThinkingState.finalContent;
                    newState.bufferedText = '';
                    newState.citations = data.citations || data.sources || prev.citations;
                    console.log('✅ Algeon request completed');
                    
                    // Reset state after a delay to prevent interference
                    setTimeout(() => {
                      resetState();
                    }, 1000);
                    
                    resolve(newState.displayedText);
                    cleanup();
                  }
                  break;
                default:
                  console.warn('Unknown data type received:', data.type);
              }
              
              return newState;
            });
            
          } catch (parseError) {
            console.error('Error parsing WebSocket message:', parseError);
          }
        };

        wsRef.current.onerror = (error) => {
          if (!hasResolvedRef.current) {
            hasResolvedRef.current = true;
            setStreamingState(prev => ({ ...prev, isStreaming: false, error: 'WebSocket connection failed.' }));
            reject(new Error('WebSocket connection failed'));
            cleanup();
          }
        };

        wsRef.current.onclose = (event) => {
          // Handle connection closure more intelligently
          if (!hasResolvedRef.current) {
            hasResolvedRef.current = true;
            thinkingParserRef.current.complete();
            setThinkingState(thinkingParserRef.current.getState());
            
            // If we have received content and connection closed normally, treat as success
            if (hasReceivedContent && event.code === 1000) {
              setStreamingState(prev => ({ ...prev, isStreaming: false, isComplete: true }));
              resolve(streamingState.displayedText);
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
  }, [resetState, cleanup, setThinkingState]);

  const stopStreaming = useCallback(() => {
    setStreamingState(prev => ({ ...prev, isStreaming: false }));
    thinkingParserRef.current.complete();
    setThinkingState(thinkingParserRef.current.getState());
    promiseRef.current?.reject(new Error('Streaming stopped by user.'));
    cleanup();
  }, [cleanup, setThinkingState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStreaming();
    };
  }, [stopStreaming]);

  return {
    streamingState: alegeonStreamingState,
    startStreaming,
    stopStreaming,
    resetState
  };
};
