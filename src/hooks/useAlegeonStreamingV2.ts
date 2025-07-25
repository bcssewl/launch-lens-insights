import { useState, useCallback, useRef, useEffect } from 'react';
import { useReasoning } from '@/contexts/ReasoningContext';
import { useAlegeonTypewriter } from './useAlegeonTypewriter';
import { type AlgeonResearchType } from '@/utils/algeonResearchTypes';
import type { ThinkingState } from '@/utils/thinkingParser';

// Configuration constants
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

interface StreamingEvent {
  type: 'thinking_started' | 'thinking_chunk' | 'thinking_complete' | 'content_chunk' | 'completion' | 'error';
  content?: string;
  accumulated_content?: string;
  final_content?: string;
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

  const { setThinkingStateForMessage, clearThinkingStateForMessage } = useReasoning();

  // Typewriter effect for smooth display
  const { displayedText: typewriterText, isTyping, progress: typewriterProgress, fastForward } = useAlegeonTypewriter(
    streamingState.bufferedText,
    {
      speed: 25, // 25 characters per second
      enabled: streamingState.currentPhase === 'generating' || streamingState.bufferedText.length > 0,
      onComplete: () => {
        console.log('🎯 Typewriter animation completed for message:', messageId);
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
  const currentThinkingStateRef = useRef<ThinkingState | null>(null);

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
    console.log('🧹 Cleaning up Algeon V2 streaming for message:', messageId);
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
    currentThinkingStateRef.current = null;
    
    // Clear thinking state for this specific message
    if (messageId) {
      clearThinkingStateForMessage(messageId);
    }
  }, [messageId, clearThinkingStateForMessage]);

  const resetState = useCallback(() => {
    console.log('🔄 Resetting Algeon V2 streaming state for message:', messageId);
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
    
    // Clear thinking state for this specific message
    if (messageId) {
      clearThinkingStateForMessage(messageId);
    }
    
    cleanup();
  }, [cleanup, messageId, clearThinkingStateForMessage]);

  const startStreaming = useCallback(async (query: string, researchType: string = 'quick_facts', clientMessageId?: string): Promise<string> => {
    console.log('🚀 Starting Algeon V2 streaming request for message:', messageId, 'query:', query.substring(0, 50));
    console.log('🔬 Research Type (input):', researchType);
    
    // Validate research type - check if it's in our valid list
    let validatedResearchType: AlgeonResearchType;
    if (VALID_RESEARCH_TYPES.includes(researchType as AlgeonResearchType)) {
      validatedResearchType = researchType as AlgeonResearchType;
    } else {
      console.warn('⚠️ Invalid research type provided, using fallback:', researchType);
      validatedResearchType = 'quick_facts'; // Safe fallback
    }
    
    console.log('✅ Validated Research Type (final):', validatedResearchType);
    
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
          console.log('🔗 WebSocket V2 connection opened for message:', messageId);
          heartbeatRef.current = window.setInterval(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ type: 'ping' }));
            }
          }, HEARTBEAT_INTERVAL);
          
          const payload = {
            query,
            research_type: validatedResearchType,
            scope: "global",
            depth: "comprehensive",
            urgency: "medium",
            stream: true,
            client_message_id: clientMessageId
          };
          
          console.log('📤 Sending WebSocket V2 payload for message:', messageId, payload);
          wsRef.current.send(JSON.stringify(payload));
        };

        wsRef.current.onmessage = (event) => {
          console.log('🟦 RAW V2 WebSocket message for', messageId, ':', event.data);
          
          try {
            const data: StreamingEvent = JSON.parse(event.data);
            console.log('📊 Parsed V2 event for message', messageId, ':', { type: data.type, phase: data.progress?.phase, percentage: data.progress?.percentage });
            
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
                  console.log('🧠 Thinking phase started for message:', messageId);
                  newState.currentPhase = 'reasoning';
                  
                  if (messageId) {
                    const newThinkingState: ThinkingState = {
                      phase: 'thinking',
                      thoughts: [],
                      isThinking: true,
                      finalContent: ''
                    };
                    currentThinkingStateRef.current = newThinkingState;
                    setThinkingStateForMessage(messageId, newThinkingState);
                  }
                  break;

                case 'thinking_chunk':
                  console.log('💭 Thinking chunk for message', messageId, ':', data.content?.substring(0, 50));
                  if (data.content) {
                    // Add thinking content to both the main message display and thinking state
                    newState.bufferedText += data.content;
                    newState.hasContent = true;
                    
                    // Also update the thinking state for the thinking panel
                    if (messageId && currentThinkingStateRef.current) {
                      const updatedThinkingState: ThinkingState = {
                        ...currentThinkingStateRef.current,
                        thoughts: [...currentThinkingStateRef.current.thoughts, data.content],
                        isThinking: true
                      };
                      currentThinkingStateRef.current = updatedThinkingState;
                      setThinkingStateForMessage(messageId, updatedThinkingState);
                    }
                  }
                  break;

                case 'thinking_complete':
                  console.log('✅ Thinking phase complete for message:', messageId);
                  newState.currentPhase = 'generating';
                  
                  if (messageId && currentThinkingStateRef.current) {
                    const completedThinkingState: ThinkingState = {
                      ...currentThinkingStateRef.current,
                      phase: 'done',
                      isThinking: false
                    };
                    currentThinkingStateRef.current = completedThinkingState;
                    setThinkingStateForMessage(messageId, completedThinkingState);
                  }
                  break;

                case 'content_chunk':
                  console.log('📝 Content chunk received for message', messageId, ', length:', data.content?.length);
                  if (data.content) {
                    newState.bufferedText += data.content;
                    newState.hasContent = true;
                  }
                  break;

                case 'completion':
                  console.log('✅ Stream completion received for message:', messageId);
                  console.log('📊 Completion event - Current streamed content length:', prev.bufferedText.length);
                  console.log('📊 Completion event - Final content available:', !!data.final_content);
                  
                  // CRITICAL FIX: Preserve streamed content, don't replace it
                  newState.isComplete = true;
                  newState.isStreaming = false;
                  newState.currentPhase = 'complete';
                  
                  // Keep the streamed content intact - this is the key fix
                  // Only use final_content as fallback if no streamed content exists
                  if (!prev.bufferedText && (data.accumulated_content || data.final_content)) {
                    console.log('⚠️ Using final_content as fallback - no streamed content available');
                    newState.bufferedText = data.accumulated_content || data.final_content || '';
                  } else {
                    console.log('✅ Preserving streamed content:', prev.bufferedText.length, 'characters');
                    // Keep existing buffered text - this preserves the smooth streaming experience
                  }
                  
                  // Process citations from completion event
                  if (data.citations) {
                    newState.citations = data.citations;
                    console.log('📚 Citations processed for message', messageId, ':', data.citations.length);
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
                    console.log('📊 Metadata stored for message', messageId, ':', {
                      total: data.metadata.duration,
                      reasoning: data.metadata.reasoning_duration,
                      generation: data.metadata.generation_duration
                    });
                  }
                  
                  // Clear thinking state when complete
                  if (messageId) {
                    setTimeout(() => {
                      clearThinkingStateForMessage(messageId);
                    }, 2000);
                  }
                  
                  // Resolve with preserved streamed content
                  if (!hasResolvedRef.current) {
                    // Use the preserved buffered text, not the final_content
                    const finalContent = prev.bufferedText || data.accumulated_content || data.final_content || '';
                    console.log('🎯 Resolving with preserved content length:', finalContent.length);
                    
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
                  console.error('❌ V2 Stream error for message', messageId, ':', data.message);
                  newState.error = data.message || 'An error occurred during research';
                  newState.isStreaming = false;
                  newState.currentPhase = 'complete';
                  
                  // Clear thinking state on error
                  if (messageId) {
                    clearThinkingStateForMessage(messageId);
                  }
                  
                  if (!hasResolvedRef.current) {
                    hasResolvedRef.current = true;
                    reject(new Error(data.message));
                    cleanup();
                  }
                  break;

                default:
                  console.warn('⚠️ Unknown V2 event type for message', messageId, ':', data.type);
              }
              
              return newState;
            });
            
          } catch (parseError) {
            console.error('❌ Error parsing V2 message for', messageId, ':', parseError);
            console.error('📄 Raw message:', event.data);
            
            setStreamingState(prev => ({ 
              ...prev, 
              error: 'Failed to parse server response',
              isStreaming: false,
              currentPhase: 'complete'
            }));
            
            if (messageId) {
              clearThinkingStateForMessage(messageId);
            }
            
            if (!hasResolvedRef.current) {
              hasResolvedRef.current = true;
              reject(new Error('Failed to parse server response'));
              cleanup();
            }
          }
        };

        wsRef.current.onerror = (error) => {
          console.error('❌ V2 WebSocket error for message', messageId, ':', error);
          if (!hasResolvedRef.current) {
            hasResolvedRef.current = true;
            const errorMsg = 'WebSocket connection failed';
            
            setStreamingState(prev => ({ 
              ...prev, 
              isStreaming: false, 
              currentPhase: 'complete',
              error: errorMsg
            }));
            
            // Show error in thinking state instead of clearing it
            if (messageId && currentThinkingStateRef.current) {
              const errorThinkingState: ThinkingState = {
                ...currentThinkingStateRef.current,
                phase: 'error',
                isThinking: false,
                thoughts: [...currentThinkingStateRef.current.thoughts, `❌ ${errorMsg}`]
              };
              setThinkingStateForMessage(messageId, errorThinkingState);
            }
            
            reject(new Error(errorMsg));
            cleanup();
          }
        };

        wsRef.current.onclose = (event) => {
          console.log('🔌 V2 WebSocket closed for message', messageId, ':', event.code, event.reason);
          
          if (!hasResolvedRef.current) {
            hasResolvedRef.current = true;
            
            setStreamingState(prev => {
              // Check if we received a completion event OR if this is a normal close (1000) with content
              if (event.code === 1000 && (prev.isComplete || prev.hasContent)) {
                const finalText = prev.bufferedText || prev.displayedText;
                resolve(finalText);
                return { ...prev, isStreaming: false, isComplete: true, currentPhase: 'complete' };
              } else if (event.code === 1000) {
                // Normal close but no content - this might be expected if completion event was already processed
                console.log('🔌 Normal WebSocket close (1000) - treating as success');
                const finalText = prev.bufferedText || prev.displayedText || '';
                resolve(finalText);
                return { ...prev, isStreaming: false, isComplete: true, currentPhase: 'complete' };
              } else {
                // Any other close code is an error
                const errorMsg = `Connection lost: ${event.code} ${event.reason || 'WebSocket closed unexpectedly'}`;
                reject(new Error(errorMsg));
                
                // Show error in thinking state instead of clearing it
                if (messageId && currentThinkingStateRef.current) {
                  const errorThinkingState: ThinkingState = {
                    ...currentThinkingStateRef.current,
                    phase: 'error',
                    isThinking: false,
                    thoughts: [...currentThinkingStateRef.current.thoughts, `❌ ${errorMsg}`]
                  };
                  setThinkingStateForMessage(messageId, errorThinkingState);
                }
                
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
        console.error('❌ Error setting up V2 WebSocket for message', messageId, ':', error);
        if (!hasResolvedRef.current) {
          hasResolvedRef.current = true;
          reject(error);
          cleanup();
        }
      }
    });
  }, [resetState, cleanup, messageId, setThinkingStateForMessage, clearThinkingStateForMessage]);

  const stopStreaming = useCallback(() => {
    console.log('🛑 Stopping Algeon V2 streaming for message:', messageId);
    setStreamingState(prev => ({ ...prev, isStreaming: false, currentPhase: 'complete' }));
    
    if (messageId) {
      clearThinkingStateForMessage(messageId);
    }
    
    promiseRef.current?.reject(new Error('Streaming stopped by user.'));
    cleanup();
  }, [cleanup, messageId, clearThinkingStateForMessage]);

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
