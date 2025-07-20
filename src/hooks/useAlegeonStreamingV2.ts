
import { useState, useCallback, useRef, useEffect } from 'react';
import { useReasoning } from '@/contexts/ReasoningContext';
import { useAlegeonTypewriter } from './useAlegeonTypewriter';
import { type AlgeonResearchType } from '@/utils/algeonResearchTypes';
import { ThinkingParser } from '@/utils/thinkingParser';
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
  const thinkingParserRef = useRef<ThinkingParser | null>(null);

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
    thinkingParserRef.current = null;
    
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
    
    // Reset thinking parser
    if (thinkingParserRef.current) {
      thinkingParserRef.current.reset();
    }
    
    cleanup();
  }, [cleanup, messageId, clearThinkingStateForMessage]);

  const startStreaming = useCallback(async (query: string, researchType: string = 'quick_facts'): Promise<string> => {
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
    
    // Initialize thinking parser
    thinkingParserRef.current = new ThinkingParser();
    
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
            research_type: validatedResearchType, // Use the properly validated research type
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
                  break;

                case 'thinking_chunk':
                case 'content_chunk':
                  console.log('📝 Processing chunk for message', messageId, 'type:', data.type, 'length:', data.content?.length);
                  if (data.content && thinkingParserRef.current) {
                    // Parse the content through the thinking parser
                    thinkingParserRef.current.parse(data.content);
                    const parserState = thinkingParserRef.current.getState();
                    
                    console.log('🧠 Parser state:', parserState.phase, 'thoughts:', parserState.thoughts.length, 'final content length:', parserState.finalContent.length);
                    
                    // Update thinking state for the panel
                    if (messageId && parserState.thoughts.length > 0) {
                      const thinkingState: ThinkingState = {
                        phase: parserState.phase,
                        thoughts: parserState.thoughts,
                        isThinking: parserState.isThinking,
                        finalContent: parserState.finalContent
                      };
                      setThinkingStateForMessage(messageId, thinkingState);
                    }
                    
                    // Update the main message content with final content
                    if (parserState.finalContent) {
                      newState.bufferedText = parserState.finalContent;
                      newState.hasContent = true;
                    }
                    
                    // Update phase based on parser state
                    if (parserState.phase === 'generating') {
                      newState.currentPhase = 'generating';
                    } else if (parserState.phase === 'thinking') {
                      newState.currentPhase = 'reasoning';
                    }
                  }
                  break;

                case 'thinking_complete':
                  console.log('✅ Thinking phase complete for message:', messageId);
                  newState.currentPhase = 'generating';
                  
                  if (thinkingParserRef.current) {
                    const parserState = thinkingParserRef.current.getState();
                    if (messageId) {
                      const completedThinkingState: ThinkingState = {
                        ...parserState,
                        phase: 'done',
                        isThinking: false
                      };
                      setThinkingStateForMessage(messageId, completedThinkingState);
                    }
                  }
                  break;

                case 'completion':
                  console.log('✅ Stream completion received for message:', messageId);
                  newState.isComplete = true;
                  newState.isStreaming = false;
                  newState.currentPhase = 'complete';
                  
                  // Complete the thinking parser
                  if (thinkingParserRef.current) {
                    thinkingParserRef.current.complete();
                    const finalParserState = thinkingParserRef.current.getState();
                    
                    // Use final content from parser or accumulated content
                    const finalContent = finalParserState.finalContent || data.accumulated_content || data.final_content || newState.bufferedText;
                    newState.bufferedText = finalContent;
                  } else {
                    // Fallback to accumulated content if parser is not available
                    if (data.accumulated_content || data.final_content) {
                      newState.bufferedText = data.accumulated_content || data.final_content || newState.bufferedText;
                    }
                  }
                  
                  // Process citations
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
                    }, 2000); // Keep thinking visible for 2 seconds after completion
                  }
                  
                  // Resolve with final content
                  if (!hasResolvedRef.current) {
                    const finalContent = newState.bufferedText;
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
            if (messageId && thinkingParserRef.current) {
              const parserState = thinkingParserRef.current.getState();
              const errorThinkingState: ThinkingState = {
                ...parserState,
                phase: 'error',
                isThinking: false,
                thoughts: [...parserState.thoughts, `❌ ${errorMsg}`]
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
                if (messageId && thinkingParserRef.current) {
                  const parserState = thinkingParserRef.current.getState();
                  const errorThinkingState: ThinkingState = {
                    ...parserState,
                    phase: 'error',
                    isThinking: false,
                    thoughts: [...parserState.thoughts, `❌ ${errorMsg}`]
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
