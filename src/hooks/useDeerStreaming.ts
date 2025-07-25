import { useState, useRef, useCallback, useEffect } from 'react';

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
}

const INITIAL_STATE: DeerStreamingState = {
  isStreaming: false,
  thoughtSteps: [],
  currentReasoning: '',
  finalAnswer: '',
  sources: [],
  error: null,
  currentPhase: 'idle'
};

export const useDeerStreaming = () => {
  const [streamingState, setStreamingState] = useState<DeerStreamingState>(INITIAL_STATE);
  const eventSourceRef = useRef<EventSource | null>(null);
  const promiseResolveRef = useRef<((result: any) => void) | null>(null);
  const promiseRejectRef = useRef<((error: any) => void) | null>(null);

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

        // Make the POST request
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream'
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        console.log('✅ Deer API connection established');
        
        setStreamingState(prev => ({
          ...prev,
          currentPhase: 'connected'
        }));

        // Handle streaming response
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response body reader available');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              console.log('🏁 Deer stream ended');
              break;
            }

            // Decode the chunk and add to buffer
            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;
            
            // Process complete lines
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer
            
            for (const line of lines) {
              if (line.trim() === '') continue;
              
              try {
                // Handle Server-Sent Events format
                if (line.startsWith('data: ')) {
                  const jsonStr = line.slice(6); // Remove 'data: ' prefix
                  if (jsonStr === '[DONE]') {
                    console.log('🏁 Deer streaming completed with [DONE]');
                    // Handle completion
                    setStreamingState(prev => {
                      const finalState = {
                        ...prev,
                        isStreaming: false,
                        currentPhase: 'completed'
                      };
                      
                      // Resolve with final result
                      if (promiseResolveRef.current) {
                        const result = {
                          thoughtSteps: finalState.thoughtSteps,
                          reasoning: finalState.currentReasoning,
                          finalAnswer: finalState.finalAnswer || finalState.currentReasoning || 'Processing completed.',
                          sources: finalState.sources
                        };
                        console.log('🎯 Resolving Deer promise with:', result);
                        promiseResolveRef.current(result);
                      }
                      
                      return finalState;
                    });
                    return;
                  }
                  
                  const data = JSON.parse(jsonStr);
                  console.log('📨 Received Deer data:', data);
                  
                  // Handle different response types based on the data structure
                  if (data.type === 'chunk' || data.delta) {
                    // Handle streaming text chunks
                    const content = data.delta?.content || data.content || '';
                    setStreamingState(prev => ({
                      ...prev,
                      currentReasoning: prev.currentReasoning + content,
                      finalAnswer: prev.finalAnswer + content,
                      currentPhase: 'generating'
                    }));
                  } else if (data.type === 'tool_use' || data.tool) {
                    // Handle tool usage
                    setStreamingState(prev => ({
                      ...prev,
                      thoughtSteps: [...prev.thoughtSteps, {
                        id: Date.now().toString(),
                        type: 'tool',
                        content: `Using tool: ${data.tool?.name || 'unknown'}`,
                        timestamp: new Date(),
                        metadata: data
                      }],
                      currentPhase: 'using_tools'
                    }));
                  } else if (data.type === 'search' || data.search) {
                    // Handle search/sources
                    setStreamingState(prev => ({
                      ...prev,
                      thoughtSteps: [...prev.thoughtSteps, {
                        id: Date.now().toString(),
                        type: 'visit',
                        content: `Searching: ${data.query || 'information'}`,
                        timestamp: new Date(),
                        metadata: data
                      }],
                      currentPhase: 'gathering_sources'
                    }));
                  } else {
                    // Generic data handling
                    const content = JSON.stringify(data);
                    setStreamingState(prev => ({
                      ...prev,
                      currentReasoning: prev.currentReasoning + ' ' + content,
                      currentPhase: 'processing'
                    }));
                  }
                } else {
                  // Handle plain text response
                  console.log('📝 Deer plain text:', line);
                  setStreamingState(prev => ({
                    ...prev,
                    finalAnswer: prev.finalAnswer + line + '\n',
                    currentPhase: 'writing_report'
                  }));
                }
              } catch (parseError) {
                console.warn('⚠️ Failed to parse Deer line:', line, parseError);
                // Add unparsed content to final answer
                setStreamingState(prev => ({
                  ...prev,
                  finalAnswer: prev.finalAnswer + line + '\n'
                }));
              }
            }
          }
        } finally {
          reader.releaseLock();
        }

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

      } catch (error) {
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
    resetState
  };
};