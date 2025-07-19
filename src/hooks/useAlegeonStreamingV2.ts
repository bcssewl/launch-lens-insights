
import { useState, useCallback, useRef, useEffect } from 'react';
import { useReasoning } from '@/contexts/ReasoningContext';
import { useAlegeonTypewriter } from './useAlegeonTypewriter';
import type { ThinkingState } from '@/utils/thinkingParser';

// Configuration constants
const STREAMING_TIMEOUT_MS = 720000; // 12 minutes
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

interface StreamingEvent {
  type: 'thinking_started' | 'thinking_chunk' | 'thinking_complete' | 'content_chunk' | 'completion' | 'error';
  content?: string;
  accumulated_content?: string;
  message?: string;
  code?: number;
  citations?: Array<{
    url: string;
    title: string;
    description: string;
  }>;
  metadata?: {
    start_time: number;
    end_time: number;
    duration: number;
    reasoning_duration: number;
    generation_duration: number;
    model_name: string;
    token_usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
  progress: {
    phase: 'reasoning' | 'generating' | 'complete';
    percentage: number;
    detail: string;
  };
}

export interface AlegeonStreamingStateV2 {
  isStreaming: boolean;
  currentPhase: 'reasoning' | 'generating' | 'complete' | 'idle';
  displayedText: string;
  bufferedText: string;
  citations: Array<{
    url: string;
    title: string;
    description: string;
  }>;
  error: string | null;
  isComplete: boolean;
  progress: number;
  progressDetail: string;
  hasContent: boolean;
  isTyping: boolean;
  typewriterProgress: number;
  metadata?: {
    duration?: number;
    reasoning_duration?: number;
    generation_duration?: number;
    model_name?: string;
    token_usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
}

export const useAlegeonStreamingV2 = (messageId: string | null) => {
  const [streamingState, setStreamingState] = useState<AlegeonStreamingStateV2>({
    isStreaming: false,
    currentPhase: 'idle',
    displayedText: '',
    bufferedText: '',
    citations: [],
    error: null,
    isComplete: false,
    progress: 0,
    progressDetail: '',
    hasContent: false,
    isTyping: false,
    typewriterProgress: 0,
  });

  const { setThinkingState, thinkingState } = useReasoning();

  // Typewriter effect for smooth display
  const { displayedText: typewriterText, isTyping, progress: typewriterProgress, fastForward } = useAlegeonTypewriter(
    streamingState.bufferedText,
    {
      speed: 25, // 25 characters per second
      enabled: streamingState.currentPhase === 'generating' || streamingState.bufferedText.length > 0,
      onComplete: () => {
        console.log('🎯 Typewriter animation completed');
      }
    }
  );

  const wsRef = useRef<WebSocket | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const heartbeatRef = useRef<number | null>(null);
  const promiseRef = useRef<{
    resolve: (value: string) => void;
    reject: (reason?: any) => void;
  } | null>(null);
  const hasResolvedRef = useRef<boolean>(false);

  // Update streaming state with typewriter values
  useEffect(() => {
    setStreamingState(prev => ({
      ...prev,
      displayedText: typewriterText,
      isTyping,
      typewriterProgress
    }));
  }, [typewriterText, isTyping, typewriterProgress]);

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
    console.log('🔄 Resetting Algeon V2 streaming state');
    setStreamingState({
      isStreaming: false,
      currentPhase: 'idle',
      displayedText: '',
      bufferedText: '',
      citations: [],
      error: null,
      isComplete: false,
      progress: 0,
      progressDetail: '',
      hasContent: false,
      isTyping: false,
      typewriterProgress: 0,
    });
    setThinkingState(null);
    cleanup();
  }, [cleanup, setThinkingState]);

  const startStreaming = useCallback(async (query: string, researchType: string = 'business_research'): Promise<string> => {
    console.log('🚀 Starting Algeon V2 streaming request for:', query.substring(0, 50));
    console.log('🔬 Research Type:', researchType);
    
    resetState();
    setStreamingState(prev => ({ ...prev, isStreaming: true, currentPhase: 'reasoning' }));

    return new Promise((resolve, reject) => {
      promiseRef.current = { resolve, reject };
      hasResolvedRef.current = false;

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
            return { ...prev, isStreaming: false, currentPhase: 'complete' };
          });
          cleanup();
        }
      }, STREAMING_TIMEOUT_MS);

      try {
        const wsUrl = 'wss://opti-agent3-wrappers.up.railway.app/api/research/stream';
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          console.log('🔗 WebSocket V2 connection opened');
          heartbeatRef.current = window.setInterval(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ type: 'ping' }));
            }
          }, HEARTBEAT_INTERVAL);
          
          const payload = {
            query,
            research_type: researchType,
            scope: "global",
            depth: "comprehensive",
            urgency: "medium",
            stream: true
          };
          
          console.log('📤 Sending WebSocket V2 payload:', payload);
          wsRef.current.send(JSON.stringify(payload));
        };

        wsRef.current.onmessage = (event) => {
          console.log('🟦 RAW V2 WebSocket message:', event.data);
          
          try {
            const data: StreamingEvent = JSON.parse(event.data);
            console.log('📊 Parsed V2 event:', { type: data.type, phase: data.progress?.phase, percentage: data.progress?.percentage });
            
            setStreamingState(prev => {
              const newState = { ...prev };
              
              // Update progress from every event
              if (data.progress) {
                newState.currentPhase = data.progress.phase;
                newState.progress = data.progress.percentage;
                newState.progressDetail = data.progress.detail;
              }
              
              switch (data.type) {
                case 'thinking_started':
                  console.log('🧠 Thinking phase started');
                  newState.currentPhase = 'reasoning';
                  setThinkingState({
                    phase: 'thinking',
                    thoughts: [],
                    isThinking: true,
                    finalContent: ''
                  });
                  break;

                case 'thinking_chunk':
                  console.log('💭 Thinking chunk:', data.content?.substring(0, 50));
                  if (data.content) {
                    setThinkingState({
                      phase: 'thinking',
                      thoughts: [...(thinkingState?.thoughts || []), data.content!],
                      isThinking: true,
                      finalContent: thinkingState?.finalContent || ''
                    });
                  }
                  break;

                case 'thinking_complete':
                  console.log('✅ Thinking phase complete');
                  newState.currentPhase = 'generating';
                  setThinkingState({
                    phase: 'done',
                    thoughts: thinkingState?.thoughts || [],
                    isThinking: false,
                    finalContent: thinkingState?.finalContent || ''
                  });
                  break;

                case 'content_chunk':
                  console.log('📝 Content chunk received, length:', data.content?.length);
                  if (data.content) {
                    newState.bufferedText += data.content;
                    newState.hasContent = true;
                  }
                  break;

                case 'completion':
                  console.log('✅ Stream completion received');
                  newState.isComplete = true;
                  newState.isStreaming = false;
                  newState.currentPhase = 'complete';
                  
                  // Use accumulated content if available
                  if (data.accumulated_content) {
                    newState.bufferedText = data.accumulated_content;
                  }
                  
                  // Process citations
                  if (data.citations) {
                    newState.citations = data.citations;
                    console.log('📚 Citations processed:', data.citations.length);
                  }
                  
                  // Store metadata
                  if (data.metadata) {
                    newState.metadata = {
                      duration: data.metadata.duration,
                      reasoning_duration: data.metadata.reasoning_duration,
                      generation_duration: data.metadata.generation_duration,
                      model_name: data.metadata.model_name,
                      token_usage: data.metadata.token_usage
                    };
                    console.log('📊 Metadata stored:', {
                      total: data.metadata.duration,
                      reasoning: data.metadata.reasoning_duration,
                      generation: data.metadata.generation_duration
                    });
                  }
                  
                  // Resolve with final content
                  if (!hasResolvedRef.current) {
                    const finalContent = data.accumulated_content || prev.bufferedText;
                    setTimeout(() => {
                      if (!hasResolvedRef.current) {
                        hasResolvedRef.current = true;
                        resolve(finalContent);
                        cleanup();
                      }
                    }, Math.max(1000, (finalContent.length / 25) * 1000));
                  }
                  break;

                case 'error':
                  console.error('❌ V2 Stream error:', data.message);
                  newState.error = data.message || 'An error occurred during research';
                  newState.isStreaming = false;
                  newState.currentPhase = 'complete';
                  
                  if (!hasResolvedRef.current) {
                    hasResolvedRef.current = true;
                    reject(new Error(data.message));
                    cleanup();
                  }
                  break;

                default:
                  console.warn('⚠️ Unknown V2 event type:', data.type);
              }
              
              return newState;
            });
            
          } catch (parseError) {
            console.error('❌ Error parsing V2 message:', parseError);
            console.error('📄 Raw message:', event.data);
            
            setStreamingState(prev => ({ 
              ...prev, 
              error: 'Failed to parse server response',
              isStreaming: false,
              currentPhase: 'complete'
            }));
            
            if (!hasResolvedRef.current) {
              hasResolvedRef.current = true;
              reject(new Error('Failed to parse server response'));
              cleanup();
            }
          }
        };

        wsRef.current.onerror = (error) => {
          console.error('❌ V2 WebSocket error:', error);
          if (!hasResolvedRef.current) {
            hasResolvedRef.current = true;
            setStreamingState(prev => ({ 
              ...prev, 
              isStreaming: false, 
              currentPhase: 'complete',
              error: 'WebSocket connection failed.' 
            }));
            reject(new Error('WebSocket connection failed'));
            cleanup();
          }
        };

        wsRef.current.onclose = (event) => {
          console.log('🔌 V2 WebSocket closed:', event.code, event.reason);
          
          if (!hasResolvedRef.current) {
            hasResolvedRef.current = true;
            
            setStreamingState(prev => {
              if (event.code === 1000 && prev.hasContent) {
                const finalText = prev.bufferedText || prev.displayedText;
                resolve(finalText);
                return { ...prev, isStreaming: false, isComplete: true, currentPhase: 'complete' };
              } else {
                const errorMsg = `WebSocket closed: ${event.code} ${event.reason || 'No reason given'}`;
                reject(new Error(errorMsg));
                return { 
                  ...prev, 
                  error: errorMsg,
                  isStreaming: false,
                  currentPhase: 'complete'
                };
              }
            });
            
            cleanup();
          }
        };

      } catch (error) {
        console.error('❌ Error setting up V2 WebSocket:', error);
        if (!hasResolvedRef.current) {
          hasResolvedRef.current = true;
          reject(error);
          cleanup();
        }
      }
    });
  }, [resetState, cleanup, setThinkingState]);

  const stopStreaming = useCallback(() => {
    console.log('🛑 Stopping Algeon V2 streaming');
    setStreamingState(prev => ({ ...prev, isStreaming: false, currentPhase: 'complete' }));
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
    resetState,
    fastForward
  };
};
