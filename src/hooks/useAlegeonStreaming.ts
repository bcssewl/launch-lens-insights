import { useState, useCallback, useRef, useEffect } from 'react';
import { detectAlgeonResearchType, type AlgeonResearchType } from '@/utils/algeonResearchTypes';

// Configuration constants
const STREAMING_TIMEOUT_MS = 300000; // 5 minutes for complex research
const HEARTBEAT_INTERVAL = 30000; // 30 seconds keep-alive

// Event types from the Algeon WebSocket
interface AlegeonStreamingEvent {
  type: 'chunk' | 'error' | 'complete';
  content?: string;
  finish_reason?: string;
  citations?: Array<{
    name: string;
    url: string;
    type?: string;
  }>;
  message?: string; // for error messages
}

export interface AlegeonStreamingState {
  isStreaming: boolean;
  currentText: string;
  citations: Array<{
    name: string;
    url: string;
    type?: string;
  }>;
  error: string | null;
}

export const useAlegeonStreaming = () => {
  const [streamingState, setStreamingState] = useState<AlegeonStreamingState>({
    isStreaming: false,
    currentText: '',
    citations: [],
    error: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const heartbeatRef = useRef<number | null>(null);
  const promiseRef = useRef<{
    resolve: (value: string) => void;
    reject: (reason?: any) => void;
  } | null>(null);

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
    promiseRef.current = null;
  }, []);

  const resetState = useCallback(() => {
    console.log('🔄 Resetting Algeon streaming state');
    setStreamingState({
      isStreaming: false,
      currentText: '',
      citations: [],
      error: null,
    });
    cleanup();
  }, [cleanup]);

  const startStreaming = useCallback(async (query: string, researchType?: AlgeonResearchType): Promise<string> => {
    const detectedType = researchType || detectAlgeonResearchType(query);
    console.log('🚀 Starting Algeon streaming for query:', query.substring(0, 100));
    console.log('📋 Using research type:', detectedType);
    
    resetState();

    return new Promise((resolve, reject) => {
      promiseRef.current = { resolve, reject };

      setStreamingState(prev => ({ ...prev, isStreaming: true }));

      timeoutRef.current = window.setTimeout(() => {
        console.log('⏰ Algeon streaming timeout reached after 5 minutes');
        cleanup();
        reject(new Error('Streaming timeout - research taking longer than expected'));
      }, STREAMING_TIMEOUT_MS);

      try {
        const wsUrl = 'wss://opti-agent3-wrappers.up.railway.app/api/research/stream';
        console.log('🔌 Connecting to Algeon WebSocket:', wsUrl);
        
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          console.log('✅ Algeon WebSocket connected');
          
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
          
          console.log('📤 Sending Algeon query:', payload);
          wsRef.current.send(JSON.stringify(payload));
        };

        wsRef.current.onmessage = (event) => {
          try {
            const data: AlegeonStreamingEvent = JSON.parse(event.data);
            
            setStreamingState(prev => {
              const newState = { ...prev };
              let shouldResolve = false;
              let shouldReject = false;
              let resolveValue = '';
              let rejectValue: Error | undefined;

              switch (data.type) {
                case 'chunk':
                  if (data.content) {
                    newState.currentText += data.content;
                  }
                  break;

                case 'complete':
                  console.log('✅ Algeon streaming completed');
                  newState.isStreaming = false;
                  if (data.citations && data.citations.length > 0) {
                    newState.citations = data.citations;
                  }
                  shouldResolve = true;
                  resolveValue = newState.currentText || 'Research completed successfully.';
                  break;

                case 'error':
                  console.error('❌ Algeon streaming error:', data.message);
                  newState.isStreaming = false;
                  newState.error = data.message || 'An error occurred during research';
                  shouldReject = true;
                  rejectValue = new Error(data.message || 'Research failed');
                  break;

                default:
                  console.warn('⚠️ Unknown Algeon event type:', data.type);
              }
              
              if (shouldResolve) {
                promiseRef.current?.resolve(resolveValue);
                cleanup();
              } else if (shouldReject) {
                promiseRef.current?.reject(rejectValue);
                cleanup();
              }

              return newState;
            });
            
          } catch (error) {
            console.error('❌ Error parsing Algeon event:', error, event.data);
            setStreamingState(prev => ({ ...prev, isStreaming: false, error: 'Failed to parse server message.' }));
            promiseRef.current?.reject(new Error('Failed to parse server message.'));
            cleanup();
          }
        };

        wsRef.current.onerror = (errorEvent) => {
          console.error('❌ Algeon WebSocket error:', errorEvent);
          setStreamingState(prev => ({ ...prev, isStreaming: false, error: 'WebSocket connection failed.' }));
          promiseRef.current?.reject(new Error('WebSocket connection failed'));
          cleanup();
        };

        wsRef.current.onclose = (event) => {
          console.log('🔌 Algeon WebSocket closed:', event.code, event.reason);
          
          setStreamingState(prev => ({ ...prev, isStreaming: false }));
          
          // If the promise is still pending, it means we closed unexpectedly.
          if (promiseRef.current) {
            // 1000 is normal closure, if we get this without a 'complete' event, it's an issue.
            if (event.code === 1000) {
                 promiseRef.current.reject(new Error('Connection closed by server without completing research.'));
            } else {
                 promiseRef.current.reject(new Error(`WebSocket closed unexpectedly: ${event.code} ${event.reason || 'No reason given'}`));
            }
          }
          cleanup();
        };

      } catch (error) {
        console.error('❌ Failed to establish Algeon WebSocket connection:', error);
        promiseRef.current?.reject(error);
        cleanup();
      }
    });
  }, [resetState, cleanup]);

  const stopStreaming = useCallback(() => {
    console.log('🛑 Stopping Algeon streaming by user');
    setStreamingState(prev => ({ ...prev, isStreaming: false }));
    promiseRef.current?.reject(new Error('Streaming stopped by user.'));
    cleanup();
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStreaming();
    };
  }, [stopStreaming]);

  return {
    streamingState,
    startStreaming,
    stopStreaming,
    resetState
  };
};