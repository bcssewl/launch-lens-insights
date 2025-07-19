
import { useState, useCallback, useRef, useEffect } from 'react';
import { detectAlgeonResearchType, type AlgeonResearchType } from '@/utils/algeonResearchTypes';
import { useReasoning } from '@/contexts/ReasoningContext';

// Configuration constants - Updated to 12 minutes
const STREAMING_TIMEOUT_MS = 720000; // 12 minutes
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

interface AlegeonStreamingEvent {
  type: string;
  content?: string;
  accumulated_content?: string;
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
  progress?: {
    chunk_number: number;
    characters_sent: number;
  };
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

  const wsRef = useRef<WebSocket | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const heartbeatRef = useRef<number | null>(null);
  const promiseRef = useRef<{
    resolve: (value: string) => void;
    reject: (reason?: any) => void;
  } | null>(null);
  const hasResolvedRef = useRef<boolean>(false);
  const requestCompletedRef = useRef<boolean>(false);

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
    setThinkingState(null);
    cleanup();
  }, [cleanup, setThinkingState]);

  const startStreaming = useCallback(async (query: string, researchType?: AlgeonResearchType): Promise<string> => {
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

      timeoutRef.current = window.setTimeout(() => {
        if (!hasResolvedRef.current) {
          hasResolvedRef.current = true;
          setStreamingState(prev => {
            const finalText = prev.bufferedText || prev.displayedText;
            if (finalText) {
              resolve(finalText);
            } else {
              reject(new Error('Research session timeout - taking longer than 12 minutes'));
            }
            return { ...prev, isStreaming: false };
          });
          cleanup();
        }
      }, STREAMING_TIMEOUT_MS);

      try {
        const wsUrl = 'wss://opti-agent3-wrappers.up.railway.app/api/research/stream';
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          console.log('🔗 WebSocket connection opened');
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
          console.log('🟦 RAW WebSocket message received:', event.data);
          
          try {
            const data: AlegeonStreamingEvent = JSON.parse(event.data);
            console.log('📊 Parsed WebSocket data:', data);
            
            setStreamingState(prev => {
              const newState = { ...prev };
              
              // Handle different event types based on backend format
              if (data.type === 'chunk') {
                if (data.accumulated_content) {
                  hasReceivedContent = true;
                  newState.bufferedText = data.accumulated_content;
                  newState.hasContent = true;
                  console.log('📝 Content chunk received, accumulated length:', data.accumulated_content.length);
                  
                  // Update progress if available
                  if (data.progress) {
                    newState.progress = Math.min(90, (data.progress.characters_sent / 5000) * 100);
                    newState.currentPhaseMessage = `Processing... ${data.progress.chunk_number} chunks received`;
                  }
                }
              } else if (data.is_complete === true) {
                if (!requestCompletedRef.current) {
                  requestCompletedRef.current = true;
                  newState.isComplete = true;
                  newState.isStreaming = false;
                  newState.displayedText = data.accumulated_content || prev.bufferedText;
                  newState.bufferedText = '';
                  newState.citations = data.citations || data.sources || [];
                  newState.finalCitations = newState.citations;
                  newState.progress = 100;
                  newState.currentPhaseMessage = 'Research completed';
                  
                  console.log('✅ Algeon request completed');
                  console.log('📚 Final citations:', newState.citations);
                  
                  if (!hasResolvedRef.current) {
                    hasResolvedRef.current = true;
                    resolve(newState.displayedText);
                    cleanup();
                  }
                }
              } else if (data.error) {
                console.error('❌ Backend error:', data.error);
                newState.error = data.error;
                newState.isStreaming = false;
                
                if (!hasResolvedRef.current) {
                  hasResolvedRef.current = true;
                  reject(new Error(data.error));
                  cleanup();
                }
              }
              
              return newState;
            });
            
          } catch (parseError) {
            console.error('❌ Error parsing WebSocket message:', parseError);
            console.error('📄 Raw message that failed to parse:', event.data);
            
            setStreamingState(prev => ({ 
              ...prev, 
              error: 'Failed to parse server response',
              isStreaming: false 
            }));
            
            if (!hasResolvedRef.current) {
              hasResolvedRef.current = true;
              reject(new Error('Failed to parse server response'));
              cleanup();
            }
          }
        };

        wsRef.current.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          if (!hasResolvedRef.current) {
            hasResolvedRef.current = true;
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
          console.log('🔌 WebSocket connection closed:', event.code, event.reason);
          
          if (!hasResolvedRef.current) {
            hasResolvedRef.current = true;
            
            // If we have received content and connection closed normally, treat as success
            if (hasReceivedContent && event.code === 1000) {
              setStreamingState(prev => {
                const finalText = prev.bufferedText || prev.displayedText;
                resolve(finalText);
                return { ...prev, isStreaming: false, isComplete: true };
              });
            } else if (event.code === 1006) {
              setStreamingState(prev => ({ 
                ...prev, 
                error: 'Connection lost unexpectedly',
                isStreaming: false 
              }));
              reject(new Error('Connection lost unexpectedly'));
            } else {
              const errorMsg = `WebSocket closed unexpectedly: ${event.code} ${event.reason || 'No reason given'}`;
              setStreamingState(prev => ({ 
                ...prev, 
                error: errorMsg,
                isStreaming: false 
              }));
              reject(new Error(errorMsg));
            }
            
            cleanup();
          }
        };

      } catch (error) {
        console.error('❌ Error setting up WebSocket:', error);
        if (!hasResolvedRef.current) {
          hasResolvedRef.current = true;
          reject(error);
          cleanup();
        }
      }
    });
  }, [resetState, cleanup, setThinkingState]);

  const stopStreaming = useCallback(() => {
    console.log('🛑 Stopping Algeon streaming');
    setStreamingState(prev => ({ ...prev, isStreaming: false }));
    setThinkingState(null);
    promiseRef.current?.reject(new Error('Streaming stopped by user.'));
    cleanup();
  }, [cleanup, setThinkingState]);

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
