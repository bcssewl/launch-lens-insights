import { useState, useCallback, useRef, useEffect } from 'react';
import { detectAlgeonResearchType, type AlgeonResearchType } from '@/utils/algeonResearchTypes';
import { ThinkingParser, type ThinkingState } from '@/utils/thinkingParser';
import { useReasoning } from '@/contexts/ReasoningContext';

// Configuration
const STREAMING_TIMEOUT_MS = 720000; // 12 minutes
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

// Simplified and robust state structure
export interface AlegeonStreamingState {
  isStreaming: boolean;
  thinkingState: ThinkingState | null;
  finalText: string;
  citations: Array<{ name: string; url: string; type?: string }>;
  error: string | null;
  progress: number;
}

// The promise will now correctly resolve with a string
type ResolveFn = (value: string) => void;
type RejectFn = (reason?: any) => void;

export const useAlegeonStreaming = (messageId: string | null) => {
  const [streamingState, setStreamingState] = useState<AlegeonStreamingState>({
    isStreaming: false,
    thinkingState: null,
    finalText: '',
    citations: [],
    error: null,
    progress: 0,
  });

  // Refs to manage WebSocket and promise lifecycle safely
  const wsRef = useRef<WebSocket | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const heartbeatRef = useRef<number | null>(null);
  
  // Ref to hold promise actions and prevent race conditions
  const promiseRef = useRef<{ resolve: ResolveFn; reject: RejectFn } | null>(null);
  const hasResolvedRef = useRef<boolean>(false);

  // Ref to hold the most up-to-date streaming result to avoid stale closures
  const resultRef = useRef({
    finalText: '',
    citations: [] as Array<{ name: string; url: string; type?: string }>,
    hasReceivedContent: false,
  });

  const thinkingParserRef = useRef(new ThinkingParser());
  const { setThinkingState, setMessageId } = useReasoning();

  const cleanup = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    
    if (wsRef.current) {
      // Remove listeners before closing to prevent lingering events
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.onclose = null;
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close(1000, "Cleanup");
      }
    }

    wsRef.current = null;
    timeoutRef.current = null;
    heartbeatRef.current = null;
    promiseRef.current = null;
    hasResolvedRef.current = false;
  }, []);

  // Centralized termination logic to prevent race conditions
  const terminate = useCallback((outcome: { success: string } | { failure: Error }) => {
    if (hasResolvedRef.current) return;
    hasResolvedRef.current = true;

    setStreamingState(prev => ({ ...prev, isStreaming: false, progress: 100 }));
    thinkingParserRef.current.complete();
    setThinkingState(thinkingParserRef.current.getState());

    if ('success' in outcome) {
      promiseRef.current?.resolve(outcome.success);
    } else {
      setStreamingState(prev => ({ ...prev, error: outcome.failure.message }));
      promiseRef.current?.reject(outcome.failure);
    }
    
    cleanup();
  }, [cleanup, setThinkingState]);

  const resetState = useCallback(() => {
    console.log('🔄 Resetting Algeon streaming state');
    setStreamingState({
      isStreaming: false,
      thinkingState: null,
      finalText: '',
      citations: [],
      error: null,
      progress: 0,
    });
    
    resultRef.current = {
      finalText: '',
      citations: [],
      hasReceivedContent: false,
    };

    thinkingParserRef.current.reset();
    setThinkingState(null);
    setMessageId(null);
    cleanup();
  }, [cleanup, setThinkingState, setMessageId]);

  const startStreaming = useCallback(async (query: string, researchType?: AlgeonResearchType): Promise<string> => {
    resetState();
    setMessageId(messageId);

    const detectedType = researchType || detectAlgeonResearchType(query);
    
    return new Promise<string>((resolve, reject) => {
      promiseRef.current = { resolve, reject };
      hasResolvedRef.current = false;

      setStreamingState(prev => ({ ...prev, isStreaming: true, progress: 5 }));

      timeoutRef.current = window.setTimeout(() => {
        const { finalText, hasReceivedContent } = resultRef.current;
        if (hasReceivedContent) {
          console.log('⏰ Timeout reached, but resolving with received content.');
          terminate({ success: finalText });
        } else {
          terminate({ failure: new Error('Research timed out after 12 minutes.') });
        }
      }, STREAMING_TIMEOUT_MS);

      try {
        const wsUrl = 'wss://opti-agent3-wrappers.up.railway.app/api/research/stream';
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          console.log('✅ Algeon WebSocket connected');
          setStreamingState(prev => ({ ...prev, progress: 10 }));
          
          heartbeatRef.current = window.setInterval(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ type: 'ping' }));
            }
          }, HEARTBEAT_INTERVAL);
          
          const payload = { query, research_type: detectedType, stream: true };
          wsRef.current.send(JSON.stringify(payload));
        };

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.content) {
              resultRef.current.hasReceivedContent = true;
              thinkingParserRef.current.parse(data.content);
            }
            
            const thinkingState = thinkingParserRef.current.getState();
            const newFinalText = thinkingState.finalContent;
            
            // Update ref immediately with the latest text
            resultRef.current.finalText = newFinalText;
            
            // Update React state
            setThinkingState(thinkingState);
            setStreamingState(prev => ({
              ...prev,
              finalText: newFinalText,
              thinkingState,
              progress: thinkingState.phase === 'thinking' ? 40 : 95,
            }));

            if (data.type === 'complete' || data.is_complete === true) {
              resultRef.current.citations = data.citations || data.sources || [];
              setStreamingState(prev => ({ ...prev, citations: resultRef.current.citations }));
              terminate({ success: resultRef.current.finalText });
            }
          } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error, event.data);
            // Don't terminate, allow stream to continue if possible
          }
        };

        wsRef.current.onerror = (event) => {
          console.error('❌ WebSocket error:', event);
          terminate({ failure: new Error('WebSocket connection failed.') });
        };

        wsRef.current.onclose = (event) => {
          console.log('🔌 WebSocket closed:', event.code, event.reason);
          // This is the crucial fallback. If the connection closes without an explicit 'complete' event,
          // we decide the outcome based on whether we received content.
          if (hasResolvedRef.current) return;

          if (resultRef.current.hasReceivedContent) {
            terminate({ success: resultRef.current.finalText });
          } else {
            terminate({ failure: new Error(`Connection closed unexpectedly: ${event.code}`) });
          }
        };

      } catch (error) {
        terminate({ failure: error instanceof Error ? error : new Error('Failed to establish WebSocket connection.') });
      }
    });
  }, [resetState, terminate, setThinkingState, setMessageId, messageId]);

  const stopStreaming = useCallback(() => {
    console.log('🛑 User stopped streaming.');
    terminate({ failure: new Error('Streaming stopped by user.') });
  }, [terminate]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    streamingState,
    startStreaming,
    stopStreaming,
  };
};
