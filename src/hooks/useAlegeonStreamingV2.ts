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
  client_message_id: string;
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
  progress?: {
    phase: 'reasoning' | 'generating' | 'complete';
    percentage: number;
    detail: string;
  };
}

interface MessageStreamingState {
  phase: 'idle' | 'reasoning' | 'generating' | 'complete';
  thinkingText: string;
  contentText: string;
  citations: Array<{
    url: string;
    title: string;
    description: string;
  }>;
  error: string | null;
  progress: number;
  progressDetail: string;
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

export const useAlegeonStreamingV2 = () => {
  // Central map to manage all streaming messages
  const [streamingStates, setStreamingStates] = useState<Map<string, MessageStreamingState>>(new Map());
  
  // Current active streaming state for compatibility with existing components
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

  // Current message ID being processed
  const [currentMessageId, setCurrentMessageId] = useState<string | null>(null);

  const { setThinkingStateForMessage, clearThinkingStateForMessage, getThinkingStateForMessage } = useReasoning();

  // Typewriter effect for smooth display
  const { displayedText: typewriterText, isTyping, progress: typewriterProgress, fastForward } = useAlegeonTypewriter(
    streamingState.bufferedText,
    {
      speed: 25, // 25 characters per second
      enabled: streamingState.currentPhase === 'generating' || streamingState.bufferedText.length > 0,
      onComplete: () => {
        console.log('🎯 Typewriter animation completed for message:', currentMessageId);
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
    console.log('🧹 Cleaning up Algeon V2 streaming for message:', currentMessageId);
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
    if (currentMessageId) {
      clearThinkingStateForMessage(currentMessageId);
    }
  }, [currentMessageId, clearThinkingStateForMessage]);

  const resetState = useCallback(() => {
    console.log('🔄 Resetting Algeon V2 streaming state for message:', currentMessageId);
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
    if (currentMessageId) {
      clearThinkingStateForMessage(currentMessageId);
    }
    
    cleanup();
  }, [cleanup, currentMessageId, clearThinkingStateForMessage]);

  const startStreaming = useCallback(async (query: string, messageId: string, researchType: string = 'quick_facts'): Promise<string> => {
    console.log('🚀 Starting Algeon V2 streaming request for message:', messageId, 'query:', query.substring(0, 50));
    console.log('🔬 Research Type (input):', researchType);
    
    // Set the current message ID for this streaming session
    setCurrentMessageId(messageId);
    
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
            client_message_id: messageId, // Now properly set from parameter
            scope: "global",
            depth: "comprehensive",
            urgency: "medium",
            stream: true
          };
          
          console.log('📤 Sending WebSocket V2 payload for message:', messageId, payload);
          wsRef.current.send(JSON.stringify(payload));
        };

        wsRef.current.onmessage = (event) => {
          console.log('🟦 RAW V2 WebSocket message for', messageId, ':', event.data);
          
          try {
            const data: StreamingEvent = JSON.parse(event.data);
            const { client_message_id } = data;
            
            console.log('📊 Parsed V2 event:', { 
              type: data.type, 
              client_message_id,
              guaranteed_sequence: true
            });

            // Skip events without client_message_id
            if (!client_message_id) {
              console.warn('⚠️ Event without client_message_id, skipping:', data.type);
              return;
            }

            // Update the central map following the guaranteed event sequence
            setStreamingStates(prevStates => {
              const newStates = new Map(prevStates);
              let currentState = newStates.get(client_message_id) || {
                phase: 'idle',
                thinkingText: '',
                contentText: '',
                citations: [],
                error: null,
                progress: 0,
                progressDetail: ''
              };

              // Follow the guaranteed event sequence
              switch (data.type) {
                case 'thinking_started':
                  console.log('🧠 [LIFECYCLE] Thinking phase started for message:', client_message_id);
                  // PHASE TRANSITION: idle → reasoning
                  currentState.phase = 'reasoning';
                  currentState.thinkingText = ''; // Reset thinking text
                  
                  // Initialize thinking state
                  const newThinkingState: ThinkingState = {
                    phase: 'thinking',
                    thoughts: [],
                    isThinking: true,
                    finalContent: ''
                  };
                  setThinkingStateForMessage(client_message_id, newThinkingState);
                  break;

                case 'thinking_chunk':
                  console.log('💭 [CHUNK] Thinking content for message', client_message_id, ':', data.content?.substring(0, 50));
                  // Only append if we're in reasoning phase
                  if (currentState.phase === 'reasoning' && data.content) {
                    currentState.thinkingText += data.content;
                    
                    // Update thinking state with accumulated content
                    const existingThinkingState = getThinkingStateForMessage(client_message_id);
                    if (existingThinkingState) {
                      const updatedThinkingState: ThinkingState = {
                        ...existingThinkingState,
                        thoughts: [...existingThinkingState.thoughts, data.content],
                        isThinking: true
                      };
                      setThinkingStateForMessage(client_message_id, updatedThinkingState);
                    }
                  }
                  break;

                case 'thinking_complete':
                  console.log('✅ [LIFECYCLE] Thinking complete - transitioning to generating for message:', client_message_id);
                  // PHASE TRANSITION: reasoning → generating
                  currentState.phase = 'generating';
                  currentState.contentText = ''; // Reset content text for new phase
                  
                  // Mark thinking as complete
                  const completedThinkingState = getThinkingStateForMessage(client_message_id);
                  if (completedThinkingState) {
                    const updatedThinkingState: ThinkingState = {
                      ...completedThinkingState,
                      phase: 'done',
                      isThinking: false
                    };
                    setThinkingStateForMessage(client_message_id, updatedThinkingState);
                  }
                  break;

                case 'content_chunk':
                  console.log('📝 [CHUNK] Content chunk for message', client_message_id, ', length:', data.content?.length);
                  // Only append if we're in generating phase
                  if (currentState.phase === 'generating' && data.content) {
                    currentState.contentText += data.content;
                  }
                  break;

                case 'completion':
                  console.log('✅ [LIFECYCLE] Stream completion for message:', client_message_id);
                  // PHASE TRANSITION: generating → complete
                  currentState.phase = 'complete';
                  
                  // Ensure final content is accurate using final_content from completion event
                  if (data.final_content) {
                    currentState.contentText = data.final_content;
                    console.log('📝 Using final_content from completion event for accuracy');
                  }
                  
                  // Process citations
                  if (data.citations) {
                    currentState.citations = data.citations;
                    console.log('📚 Citations processed:', data.citations.length);
                  }
                  
                  // Store metadata
                  if (data.metadata) {
                    currentState.metadata = {
                      duration: data.metadata.duration,
                      reasoning_duration: data.metadata.reasoning_duration,
                      generation_duration: data.metadata.generation_duration,
                      model_name: data.metadata.model_name,
                      token_usage: data.metadata.token_usage
                    };
                    console.log('📊 Metadata stored:', currentState.metadata);
                  }
                  
                  // Clean up thinking state after completion
                  setTimeout(() => {
                    clearThinkingStateForMessage(client_message_id);
                  }, 2000);
                  
                  // Resolve promise for the current message
                  if (client_message_id === messageId && !hasResolvedRef.current) {
                    const finalContent = currentState.contentText;
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
                  console.error('❌ [ERROR] Stream error for message', client_message_id, ':', data.message);
                  currentState.error = data.message || 'An error occurred during research';
                  currentState.phase = 'complete';
                  
                  // Clean up thinking state on error
                  clearThinkingStateForMessage(client_message_id);
                  
                  if (client_message_id === messageId && !hasResolvedRef.current) {
                    hasResolvedRef.current = true;
                    reject(new Error(data.message));
                    cleanup();
                  }
                  break;

                default:
                  console.warn('⚠️ Unknown event type (not in guaranteed sequence):', data.type);
              }

              // Update progress if provided
              if (data.progress) {
                currentState.progress = data.progress.percentage;
                currentState.progressDetail = data.progress.detail;
              }

              newStates.set(client_message_id, currentState);
              return newStates;
            });

            // Update the current streaming state for the active message
            if (client_message_id === messageId) {
              setStreamingState(prev => {
                const messageState = streamingStates.get(client_message_id);
                if (!messageState) return prev;

                return {
                  ...prev,
                  isStreaming: messageState.phase !== 'complete' && messageState.phase !== 'idle',
                  currentPhase: messageState.phase,
                  bufferedText: messageState.contentText,
                  citations: messageState.citations,
                  error: messageState.error,
                  isComplete: messageState.phase === 'complete',
                  progress: messageState.progress,
                  progressDetail: messageState.progressDetail,
                  hasContent: messageState.contentText.length > 0,
                  metadata: messageState.metadata
                };
              });
            }
            
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
  }, [resetState, cleanup, setThinkingStateForMessage, clearThinkingStateForMessage, getThinkingStateForMessage, streamingStates]);

  const stopStreaming = useCallback((isUserInitiated: boolean = true) => {
    if (isUserInitiated) {
      console.log('🛑 User initiated stop for Algeon V2 streaming, message:', currentMessageId);
    } else {
      console.log('🧹 System cleanup for Algeon V2 streaming, message:', currentMessageId);
    }
    
    setStreamingState(prev => ({ ...prev, isStreaming: false, currentPhase: 'complete' }));
    
    if (currentMessageId) {
      clearThinkingStateForMessage(currentMessageId);
    }
    
    // Only reject the promise if it's a user-initiated stop
    if (isUserInitiated && promiseRef.current) {
      promiseRef.current.reject(new Error('Streaming stopped by user.'));
    } else if (promiseRef.current) {
      // For system cleanup, resolve with current content if available
      setStreamingState(prev => {
        const finalText = prev.bufferedText || prev.displayedText;
        if (finalText && promiseRef.current) {
          promiseRef.current.resolve(finalText);
        }
        return prev;
      });
    }
    
    cleanup();
  }, [cleanup, currentMessageId, clearThinkingStateForMessage]);

  useEffect(() => {
    return () => {
      // This is system cleanup, not user-initiated
      stopStreaming(false);
    };
  }, [stopStreaming]);

  // Helper function to get state for any message
  const getStreamStateFor = useCallback((messageId: string) => {
    return streamingStates.get(messageId);
  }, [streamingStates]);

  return {
    streamingState,
    startStreaming,
    stopStreaming,
    resetState,
    fastForward,
    getStreamStateFor,
    streamingStates
  };
};
