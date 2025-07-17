
import { useState, useCallback, useRef, useEffect } from 'react';
import { detectAlgeonResearchType, type AlgeonResearchType } from '@/utils/algeonResearchTypes';

// Configuration constants
const STREAMING_TIMEOUT_MS = 300000; // 5 minutes for complex research
const HEARTBEAT_INTERVAL = 30000; // 30 seconds keep-alive

// Event types from the Algeon WebSocket - Updated to match backend
interface AlegeonStreamingEvent {
  type: string; // Allow any type to handle backend variations
  content?: string;
  finish_reason?: string;
  is_complete?: boolean; // Backend sends this field
  model_used?: string; // Backend sends this field
  citations?: Array<{
    name: string;
    url: string;
    type?: string;
  }>;
  message?: string; // for error messages
  error?: string; // Alternative error field
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
      let hasResolved = false; // Track if promise is already resolved
      let hasReceivedContent = false; // Track if we've received any content

      setStreamingState(prev => ({ ...prev, isStreaming: true }));

      timeoutRef.current = window.setTimeout(() => {
        console.log('⏰ Algeon streaming timeout reached after 5 minutes');
        if (!hasResolved) {
          hasResolved = true;
          // If we have content, resolve with it instead of rejecting
          if (hasReceivedContent && streamingState.currentText) {
            console.log('⏰ Timeout but have content, resolving with:', streamingState.currentText.substring(0, 100));
            resolve(streamingState.currentText);
          } else {
            reject(new Error('Streaming timeout - research taking longer than expected'));
          }
          cleanup();
        }
      }, STREAMING_TIMEOUT_MS);

      try {
        const wsUrl = 'wss://opti-agent3-wrappers.up.railway.app/api/research/stream';
        console.log('🔌 Connecting to Algeon WebSocket:', wsUrl);
        
        wsRef.current = new WebSocket(wsUrl);
        let connectionEstablished = false;

        wsRef.current.onopen = () => {
          console.log('✅ Algeon WebSocket connected');
          connectionEstablished = true;
          
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
          // Enhanced debugging
          console.log('🟦 RAW WebSocket message received:', event.data);
          
          try {
            const data: AlegeonStreamingEvent = JSON.parse(event.data);
            console.log('🟦 PARSED message type:', data.type);
            console.log('🟦 PARSED message data:', data);
            
            setStreamingState(prev => {
              const newState = { ...prev };
              let shouldResolve = false;
              let shouldReject = false;
              let resolveValue = '';
              let rejectValue: Error | undefined;

              // Handle different event types more flexibly
              switch (data.type) {
                case 'chunk':
                  if (data.content) {
                    hasReceivedContent = true;
                    newState.currentText += data.content;
                    console.log('📝 Content chunk added, total length:', newState.currentText.length);
                  }
                  
                  // Check if backend indicates completion via is_complete field
                  if (data.is_complete === true) {
                    console.log('✅ Backend indicates completion via is_complete flag');
                    if (!hasResolved) {
                      hasResolved = true;
                      newState.isStreaming = false;
                      shouldResolve = true;
                      resolveValue = newState.currentText || 'Research completed successfully.';
                    }
                  }
                  break;

                case 'complete':
                  console.log('✅ Algeon streaming completed with complete event');
                  if (!hasResolved) {
                    hasResolved = true;
                    newState.isStreaming = false;
                    if (data.citations && data.citations.length > 0) {
                      newState.citations = data.citations;
                    }
                    shouldResolve = true;
                    resolveValue = newState.currentText || 'Research completed successfully.';
                  }
                  break;

                case 'error':
                  console.error('❌ Algeon streaming error:', data.message || data.error);
                  if (!hasResolved) {
                    hasResolved = true;
                    newState.isStreaming = false;
                    newState.error = data.message || data.error || 'An error occurred during research';
                    shouldReject = true;
                    rejectValue = new Error(data.message || data.error || 'Research failed');
                  }
                  break;

                default:
                  console.warn('⚠️ Unknown Algeon event type:', data.type);
                  // Still process content if available
                  if (data.content) {
                    hasReceivedContent = true;
                    newState.currentText += data.content;
                  }
              }
              
              // Handle promise resolution/rejection after state update
              if (shouldResolve) {
                setTimeout(() => {
                  resolve(resolveValue);
                  cleanup();
                }, 100); // Reduced delay
              } else if (shouldReject) {
                setTimeout(() => {
                  reject(rejectValue);
                  cleanup();
                }, 100);
              }

              return newState;
            });
            
          } catch (error) {
            console.error('❌ Error parsing Algeon event:', error, event.data);
            // Don't immediately reject on parse errors - log and continue
            console.warn('⚠️ Continuing despite parse error');
          }
        };

        wsRef.current.onerror = (errorEvent) => {
          console.error('❌ Algeon WebSocket error:', errorEvent);
          if (!hasResolved) {
            hasResolved = true;
            setStreamingState(prev => ({ 
              ...prev, 
              isStreaming: false, 
              error: 'WebSocket connection failed.' 
            }));
            reject(new Error('WebSocket connection failed'));
            cleanup();
          }
        };

        wsRef.current.onclose = (event) => {
          console.log('🟥 WebSocket CLOSED - Code:', event.code);
          console.log('🟥 WebSocket CLOSED - Reason:', event.reason);
          console.log('🟥 WebSocket CLOSED - Was Clean:', event.wasClean);
          console.log('🟥 Has received content:', hasReceivedContent);
          console.log('🟥 Has resolved already:', hasResolved);
          
          setStreamingState(prev => {
            console.log('🟥 Current text accumulated:', prev.currentText.substring(0, 200));
            return { ...prev, isStreaming: false };
          });
          
          // Handle connection closure more intelligently
          if (!hasResolved) {
            hasResolved = true;
            
            // If we have received content and connection closed normally, treat as success
            if (hasReceivedContent && event.code === 1000) {
              // Get the current text from state
              setStreamingState(prev => {
                const finalText = prev.currentText;
                console.log('✅ Normal closure with content, resolving with:', finalText.substring(0, 100));
                resolve(finalText || 'Research completed.');
                return prev;
              });
            } else if (!connectionEstablished) {
              reject(new Error('Failed to establish connection to research service'));
            } else if (event.code === 1006) {
              // Abnormal closure
              reject(new Error('Connection lost unexpectedly'));
            } else if (!hasReceivedContent) {
              // No content received before closure
              reject(new Error(`Connection closed without receiving any content: ${event.code} ${event.reason || ''}`));
            } else {
              // Other closure codes
              reject(new Error(`WebSocket closed unexpectedly: ${event.code} ${event.reason || 'No reason given'}`));
            }
          }
          cleanup();
        };

      } catch (error) {
        console.error('❌ Failed to establish Algeon WebSocket connection:', error);
        if (!hasResolved) {
          hasResolved = true;
          reject(error);
          cleanup();
        }
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
