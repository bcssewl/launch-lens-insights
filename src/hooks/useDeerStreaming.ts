import { useState, useRef, useCallback, useEffect } from 'react';
import { fetchStream } from '../utils/fetchStream';

export interface DeerThoughtStep {
  id: string;
  type: 'tool' | 'reasoning' | 'visit' | 'writing_report';
  content: string;
  timestamp: Date;
  metadata?: any;
}

export interface DeerSource {
  url: string;
  title?: string;
  content: string;
  timestamp: Date;
}

export interface DeerStreamingState {
  isStreaming: boolean;
  thoughtSteps: DeerThoughtStep[];
  currentReasoning: string;
  finalAnswer: string;
  sources: DeerSource[];
  error: string | null;
  currentPhase: string;
  isWaitingForFeedback: boolean;
}

const INITIAL_STATE: DeerStreamingState = {
  isStreaming: false,
  thoughtSteps: [],
  currentReasoning: '',
  finalAnswer: '',
  sources: [],
  error: null,
  currentPhase: 'idle',
  isWaitingForFeedback: false,
};

export const useDeerStreaming = () => {
  const [streamingState, setStreamingState] = useState<DeerStreamingState>(INITIAL_STATE);
  const eventSourceRef = useRef<EventSource | null>(null);
  const promiseResolveRef = useRef<((result: any) => void) | null>(null);
  const promiseRejectRef = useRef<((error: any) => void) | null>(null);
  const feedbackResolver = useRef<((feedback: string) => void) | null>(null);

  const cleanup = useCallback(() => {
    // No EventSource to clean up in new implementation
    console.log('🧹 Cleaning up Deer streaming connection');
  }, []);

  const resetState = useCallback(() => {
    console.log('🔄 Resetting Deer streaming state');
    cleanup();
    setStreamingState(INITIAL_STATE);
    promiseResolveRef.current = null;
    promiseRejectRef.current = null;
  }, [cleanup]);

  const startStreaming = useCallback((question: string): Promise<any> => {
    console.log('🦌 Starting Deer streaming for question:', question);
    
    return new Promise(async (resolve, reject) => {
      // Store promise handlers
      promiseResolveRef.current = resolve;
      promiseRejectRef.current = reject;

      // Reset state
      setStreamingState(prev => ({
        ...INITIAL_STATE,
        isStreaming: true,
        currentPhase: 'connecting'
      }));

      try {
        const url = 'https://deer-flow-wrappers.up.railway.app/api/chat/stream';
        
        console.log('🔗 Connecting to Deer API endpoint:', url);
        
        // Prepare the ChatRequest payload
        const requestBody = {
          messages: [
            {
              role: "user",
              content: question
            }
          ],
          debug: true, // Enable debug for better insight
          thread_id: `deer-${Date.now()}`, // Unique thread ID
          max_plan_iterations: 1,
          max_step_num: 3,
          max_search_results: 3,
          auto_accepted_plan: false,
          enable_background_investigation: true,
          report_style: "academic",
          enable_deep_thinking: false
        };

        console.log('📤 Sending Deer request:', requestBody);

        // Update state to connecting
        setStreamingState(prev => ({
          ...prev,
          currentPhase: 'sending_request'
        }));

        console.log('✅ Deer API connection established');
        
        setStreamingState(prev => ({
          ...prev,
          currentPhase: 'connected'
        }));

        // Use the fetchStream utility to handle SSE
        const requestInit: RequestInit = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        };

        for await (const { event, data } of fetchStream(url, requestInit)) {
          if (!streamingState.isStreaming) break; // Stop processing if streaming is stopped

          try {
            const parsedData = JSON.parse(data);
            console.log(`📨 Received Deer event: ${event}`, parsedData);

            if (parsedData.type === 'plan_generation' || parsedData.type === 'thought') {
              setStreamingState(prev => ({
                ...prev,
                isWaitingForFeedback: true,
                thoughtSteps: [...prev.thoughtSteps, {
                  id: Date.now().toString(),
                  type: 'reasoning',
                  content: parsedData.content || JSON.stringify(parsedData.plan),
                  timestamp: new Date(),
                  metadata: parsedData,
                }],
              }));

              const userFeedback = await new Promise<string>((resolve) => {
                feedbackResolver.current = resolve;
              });

              setStreamingState(prev => ({ ...prev, isWaitingForFeedback: false }));
              
              // Here you would send the feedback back to the server
              // This part needs a way to send data back through the stream, which fetchStream doesn't support
              // For now, we'll just log it and continue
              console.log("User feedback received:", userFeedback);

            }
            
            // Handle different event types based on mock frontend expectations
            switch (event || parsedData.type) {
              case 'message_chunk':
                // Handle streaming text chunks
                const content = parsedData.content || parsedData.text || '';
                setStreamingState(prev => ({
                  ...prev,
                  currentReasoning: prev.currentReasoning + content,
                  finalAnswer: prev.finalAnswer + content,
                  currentPhase: 'generating'
                }));
                break;
                
              case 'tool_call':
                // Handle tool calls
                setStreamingState(prev => ({
                  ...prev,
                  thoughtSteps: [...prev.thoughtSteps, {
                    id: parsedData.id || Date.now().toString(),
                    type: 'tool',
                    content: `Using tool: ${parsedData.function?.name || parsedData.name || 'unknown'}`,
                    timestamp: new Date(),
                    metadata: parsedData
                  }],
                  currentPhase: 'using_tools'
                }));
                break;
                
              case 'tool_call_result':
                // Handle tool execution results
                setStreamingState(prev => ({
                  ...prev,
                  thoughtSteps: [...prev.thoughtSteps, {
                    id: parsedData.tool_call_id || Date.now().toString(),
                    type: 'reasoning',
                    content: `Tool result: ${parsedData.result || 'completed'}`,
                    timestamp: new Date(),
                    metadata: parsedData
                  }],
                  sources: parsedData.sources ? [...prev.sources, ...parsedData.sources] : prev.sources,
                  currentPhase: 'gathering_sources'
                }));
                break;
                
              case 'thinking':
              case 'reasoning':
                // Handle reasoning/thinking steps
                const reasoning = parsedData.content || parsedData.text || '';
                setStreamingState(prev => ({
                  ...prev,
                  currentReasoning: prev.currentReasoning + reasoning,
                  thoughtSteps: [...prev.thoughtSteps, {
                    id: Date.now().toString(),
                    type: 'reasoning',
                    content: reasoning,
                    timestamp: new Date(),
                    metadata: parsedData
                  }],
                  currentPhase: 'thinking'
                }));
                break;
                
              case 'search':
              case 'visit':
                // Handle search/visit events
                setStreamingState(prev => ({
                  ...prev,
                  thoughtSteps: [...prev.thoughtSteps, {
                    id: Date.now().toString(),
                    type: 'visit',
                    content: `Searching: ${parsedData.query || parsedData.url || 'information'}`,
                    timestamp: new Date(),
                    metadata: parsedData
                  }],
                  currentPhase: 'gathering_sources'
                }));
                break;
                
              default:
                // Fallback handling for unknown event types
                console.log('📝 Unknown event type, treating as content:', event, parsedData);
                const fallbackContent = parsedData.content || parsedData.text || JSON.stringify(parsedData);
                setStreamingState(prev => ({
                  ...prev,
                  finalAnswer: prev.finalAnswer + fallbackContent,
                  currentPhase: 'processing'
                }));
                break;
            }
          } catch (parseError) {
            console.warn('⚠️ Failed to parse Deer event data:', data, parseError);
            // Add unparsed content to final answer
            setStreamingState(prev => ({
              ...prev,
              finalAnswer: prev.finalAnswer + data + '\n'
            }));
          }
        }

        console.log('🏁 Deer stream ended');

        // Final completion if not already handled
        setStreamingState(prev => {
          if (prev.isStreaming) {
            const finalState = {
              ...prev,
              isStreaming: false,
              currentPhase: 'completed'
            };
            
            if (promiseResolveRef.current) {
              const result = {
                thoughtSteps: finalState.thoughtSteps,
                reasoning: finalState.currentReasoning,
                finalAnswer: finalState.finalAnswer || finalState.currentReasoning || 'Processing completed.',
                sources: finalState.sources
              };
              console.log('🎯 Final Deer completion with:', result);
              promiseResolveRef.current(result);
            }
            
            return finalState;
          }
          return prev;
        });

      } catch (error: any) {
        console.error('❌ Failed to start Deer streaming:', error);
        setStreamingState(prev => ({
          ...prev,
          isStreaming: false,
          error: error.message,
          currentPhase: 'error'
        }));
        
        if (promiseRejectRef.current) {
          promiseRejectRef.current(error);
        }
      }
    });
  }, []);

  const stopStreaming = useCallback(() => {
    console.log('⏹️ Manually stopping Deer streaming');
    setStreamingState(prev => ({
      ...prev,
      isStreaming: false,
      currentPhase: 'stopped'
    }));
    cleanup();
  }, [cleanup]);

  const sendFeedback = useCallback((feedback: string) => {
    if (feedbackResolver.current) {
      feedbackResolver.current(feedback);
      feedbackResolver.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Component unmounting, cleaning up Deer streaming');
      cleanup();
    };
  }, [cleanup]);

  return {
    streamingState,
    startStreaming,
    stopStreaming,
    resetState,
    sendFeedback,
  };
};