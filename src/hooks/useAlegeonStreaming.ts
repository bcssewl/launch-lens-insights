import { useState, useCallback, useRef, useEffect } from 'react';

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

  const resetState = useCallback(() => {
    console.log('🔄 Resetting Algeon streaming state');
    setStreamingState({
      isStreaming: false,
      currentText: '',
      citations: [],
      error: null,
    });
  }, []);

  const startStreaming = useCallback(async (query: string, researchType: string = 'comprehensive'): Promise<string> => {
    console.log('🚀 Starting Algeon streaming for query:', query.substring(0, 100));
    
    resetState();

    return new Promise((resolve, reject) => {
      // Clear any existing connections
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }

      // Set timeout for the streaming request
      timeoutRef.current = window.setTimeout(() => {
        console.log('⏰ Algeon streaming timeout reached after 5 minutes');
        if (wsRef.current) {
          wsRef.current.close();
        }
        reject(new Error('Streaming timeout - research taking longer than expected'));
      }, STREAMING_TIMEOUT_MS);

      try {
        const wsUrl = 'wss://opti-agent3-wrappers.up.railway.app/api/research/stream';
        console.log('🔌 Connecting to Algeon WebSocket:', wsUrl);
        
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          console.log('✅ Algeon WebSocket connected');
          
          // Set streaming state to true
          setStreamingState(prev => ({
            ...prev,
            isStreaming: true,
          }));
          
          // Set up heartbeat to maintain connection
          heartbeatRef.current = window.setInterval(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ type: 'ping' }));
            }
          }, HEARTBEAT_INTERVAL);
          
          // Send query with Algeon format
          const payload = {
            query: query,
            research_type: researchType,
            scope: "global",
            depth: "executive_summary"
          };
          
          console.log('📤 Sending Algeon query:', payload);
          wsRef.current.send(JSON.stringify(payload));
        };

        wsRef.current.onmessage = (event) => {
          try {
            console.log('📨 Raw Algeon message:', event.data);
            const data: AlegeonStreamingEvent = JSON.parse(event.data);
            console.log('📋 Parsed Algeon event:', {
              type: data.type,
              contentLength: data.content?.length,
              finishReason: data.finish_reason
            });
            
            setStreamingState(prev => {
              const newState = { ...prev };

              switch (data.type) {
                case 'chunk':
                  if (data.content) {
                    newState.currentText += data.content;
                    console.log('📝 Added chunk, total length:', newState.currentText.length);
                  }
                  break;

                case 'complete':
                  console.log('✅ Algeon streaming completed');
                  newState.isStreaming = false;
                  
                  // Handle citations if available
                  if (data.citations && data.citations.length > 0) {
                    newState.citations = data.citations;
                    console.log('📚 Citations received:', data.citations.length);
                  }
                  
                  // Clean up timers
                  if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                  }
                  
                  if (heartbeatRef.current) {
                    clearInterval(heartbeatRef.current);
                    heartbeatRef.current = null;
                  }
                  
                  resolve(newState.currentText || 'Research completed successfully.');
                  break;

                case 'error':
                  console.error('❌ Algeon streaming error:', data.message);
                  newState.isStreaming = false;
                  newState.error = data.message || 'An error occurred during research';
                  
                  // Clean up timers
                  if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                  }
                  
                  if (heartbeatRef.current) {
                    clearInterval(heartbeatRef.current);
                    heartbeatRef.current = null;
                  }
                  
                  reject(new Error(data.message || 'Research failed'));
                  break;

                default:
                  console.warn('⚠️ Unknown Algeon event type:', data.type);
              }

              return newState;
            });

            // Handle completion based on finish_reason
            if (data.finish_reason === "stop") {
              console.log('🛑 Stream finished with stop reason');
              // The complete event should handle the resolution
            }
            
          } catch (error) {
            console.error('❌ Error parsing Algeon event:', error);
            console.log('Raw event data:', event.data);
          }
        };

        wsRef.current.onerror = (error) => {
          console.error('❌ Algeon WebSocket error:', error);
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          if (heartbeatRef.current) {
            clearInterval(heartbeatRef.current);
            heartbeatRef.current = null;
          }
          reject(new Error('WebSocket connection failed'));
        };

        wsRef.current.onclose = (event) => {
          console.log('🔌 Algeon WebSocket closed:', event.code, event.reason);
          
          setStreamingState(prev => ({
            ...prev,
            isStreaming: false,
          }));
          
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          if (heartbeatRef.current) {
            clearInterval(heartbeatRef.current);
            heartbeatRef.current = null;
          }
          
          if (event.code !== 1000 && event.code !== 1005) {
            // Unexpected close
            reject(new Error(`WebSocket closed unexpectedly: ${event.code} ${event.reason}`));
          }
        };

      } catch (error) {
        console.error('❌ Failed to establish Algeon WebSocket connection:', error);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        reject(error);
      }
    });
  }, [resetState]);

  const stopStreaming = useCallback(() => {
    console.log('🛑 Stopping Algeon streaming');
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    resetState();
  }, [resetState]);

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