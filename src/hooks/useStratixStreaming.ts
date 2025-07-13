
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { 
  StratixStreamingEvent, 
  StratixSource, 
  StratixAgent, 
  StratixStreamingState 
} from '@/types/stratixStreaming';

// Configuration constants
const STREAMING_TIMEOUT_MS = 300000; // 5 minutes for complex research
const HEARTBEAT_INTERVAL = 30000; // 30 seconds keep-alive
const EVENT_THROTTLE_MS = 100; // Throttle UI updates for performance

export const useStratixStreaming = () => {
  const [streamingState, setStreamingState] = useState<StratixStreamingState>({
    isStreaming: false,
    currentPhase: '',
    overallProgress: 0,
    activeAgents: [],
    discoveredSources: [],
    partialText: '',
    error: null,
    lastHeartbeat: Date.now()
  });

  const wsRef = useRef<WebSocket | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const heartbeatRef = useRef<number | null>(null);
  const eventQueueRef = useRef<StratixStreamingEvent[]>([]);
  const throttleRef = useRef<number | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  // Get current user ID for WebSocket connection
  const getCurrentUserId = useCallback(async (): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || 'anonymous';
  }, []);

  // Process event queue with throttling for smooth performance
  const processEventQueue = useCallback(() => {
    if (eventQueueRef.current.length === 0) return;

    const events = [...eventQueueRef.current];
    eventQueueRef.current = [];

    setStreamingState(prev => {
      let newState = { ...prev };

      events.forEach(event => {
        const eventType = event.type?.toLowerCase() || 'unknown';

        try {
          switch (eventType) {
            case 'session_id':
              console.log('🔗 Stratix session established:', event.session_id);
              sessionIdRef.current = event.session_id || null;
              newState.isStreaming = true;
              newState.currentPhase = 'Connected to Stratix Research Engine';
              newState.overallProgress = 5;
              newState.lastHeartbeat = Date.now();
              break;

            case 'stream_start':
              console.log('🚀 Stratix streaming started');
              newState.currentPhase = 'Starting research analysis...';
              newState.overallProgress = Math.max(15, newState.overallProgress);
              break;

            case 'stream_chunk':
              console.log('📝 Stratix chunk received, length:', event.content?.length || 0);
              if (event.content && typeof event.content === 'string') {
                newState.partialText += event.content;
              }
              newState.overallProgress = Math.min(90, newState.overallProgress + 1);
              break;

            case 'stream_end':
              console.log('✅ Stratix streaming completed');
              newState.isStreaming = false;
              newState.currentPhase = 'Research completed';
              newState.overallProgress = 100;
              break;

            case 'error':
              console.error('❌ Stratix streaming error:', event.message);
              newState.isStreaming = false;
              newState.error = event.message || 'An error occurred during research';
              newState.currentPhase = 'Error occurred';
              break;

            default:
              console.log('📦 Unknown Stratix event type:', eventType);
              if (event.message) {
                newState.currentPhase = event.message;
              }
              break;
          }
        } catch (error) {
          console.error('Error processing Stratix event:', eventType, error);
        }
      });

      return newState;
    });
  }, []);

  // Throttled event processing for smooth UI updates
  const queueEvent = useCallback((event: StratixStreamingEvent) => {
    eventQueueRef.current.push(event);
    
    if (throttleRef.current) {
      clearTimeout(throttleRef.current);
    }
    
    throttleRef.current = window.setTimeout(processEventQueue, EVENT_THROTTLE_MS);
  }, [processEventQueue]);

  const resetState = useCallback(() => {
    console.log('🔄 Resetting Stratix streaming state');
    setStreamingState({
      isStreaming: false,
      currentPhase: '',
      overallProgress: 0,
      activeAgents: [],
      discoveredSources: [],
      partialText: '',
      error: null,
      lastHeartbeat: Date.now()
    });
    eventQueueRef.current = [];
    sessionIdRef.current = null;
  }, []);

  const startStreaming = useCallback(async (query: string, sessionId: string): Promise<string> => {
    console.log('🚀 Starting Stratix streaming for query:', query.substring(0, 100));
    
    resetState();

    return new Promise(async (resolve, reject) => {
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
        console.log('⏰ Stratix streaming timeout reached after 5 minutes');
        if (wsRef.current) {
          wsRef.current.close();
        }
        reject(new Error('Streaming timeout - research taking longer than expected'));
      }, STREAMING_TIMEOUT_MS);

      try {
        const userId = await getCurrentUserId();
        const wsUrl = `wss://web-production-06ef2.up.railway.app/ws/${userId}`;
        console.log('🔌 Connecting to new Stratix WebSocket:', wsUrl);
        
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          console.log('✅ New Stratix WebSocket connected');
          
          // Set up heartbeat to maintain connection
          heartbeatRef.current = window.setInterval(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ type: 'ping' }));
            }
          }, HEARTBEAT_INTERVAL);
          
          // Send query with new format
          const payload = {
            message: query,
            provider: 'openai', // Let the agent handle provider selection
            session_id: sessionIdRef.current // Use existing session if available
          };
          
          console.log('📤 Sending Stratix query:', payload);
          wsRef.current.send(JSON.stringify(payload));
        };

        wsRef.current.onmessage = (event) => {
          try {
            console.log('📨 Raw Stratix message:', event.data);
            const data: StratixStreamingEvent = JSON.parse(event.data);
            console.log('📋 Parsed Stratix event:', {
              type: data.type,
              message: data.message?.substring(0, 100),
              content: data.content?.substring(0, 100)
            });
            
            queueEvent(data);

            // Resolve when we get the stream_end event
            if (data.type === 'stream_end') {
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }
              
              if (heartbeatRef.current) {
                clearInterval(heartbeatRef.current);
                heartbeatRef.current = null;
              }
              
              const finalAnswer = streamingState.partialText || 'Research completed successfully.';
              console.log('✅ New Stratix streaming completed with response length:', finalAnswer.length);
              resolve(finalAnswer);
            }
          } catch (error) {
            console.error('❌ Error parsing Stratix event:', error);
            console.log('Raw event data:', event.data);
          }
        };

        wsRef.current.onerror = (error) => {
          console.error('❌ New Stratix WebSocket error:', error);
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
          console.log('🔌 New Stratix WebSocket closed:', event.code, event.reason);
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          if (heartbeatRef.current) {
            clearInterval(heartbeatRef.current);
            heartbeatRef.current = null;
          }
          
          if (event.code !== 1000 && event.code !== 1005) {
            reject(new Error(`WebSocket closed unexpectedly: ${event.code} ${event.reason}`));
          }
        };

      } catch (error) {
        console.error('❌ Failed to establish new Stratix WebSocket connection:', error);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        reject(error);
      }
    });
  }, [getCurrentUserId, queueEvent, resetState, streamingState.partialText]);

  const stopStreaming = useCallback(() => {
    console.log('🛑 Stopping Stratix streaming');
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    
    if (throttleRef.current) {
      clearTimeout(throttleRef.current);
      throttleRef.current = null;
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
