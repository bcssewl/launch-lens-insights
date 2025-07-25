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
    if (eventSourceRef.current) {
      console.log('🧹 Cleaning up Deer EventSource connection');
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
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
    
    return new Promise((resolve, reject) => {
      // Store promise handlers
      promiseResolveRef.current = resolve;
      promiseRejectRef.current = reject;

      // Reset state
      setStreamingState(INITIAL_STATE);

      try {
        // Encode the question for URL
        const encodedQuestion = encodeURIComponent(question);
        const url = `https://deer-flow-wrappers.up.railway.app/search?question=${encodedQuestion}&is_reasoning=true`;
        
        console.log('🔗 Connecting to Deer SSE endpoint:', url);
        
        // Create EventSource connection
        const eventSource = new EventSource(url);
        eventSourceRef.current = eventSource;

        // Update state to streaming
        setStreamingState(prev => ({
          ...prev,
          isStreaming: true,
          currentPhase: 'connecting'
        }));

        // Handle successful connection
        eventSource.onopen = () => {
          console.log('✅ Deer SSE connection opened');
          setStreamingState(prev => ({
            ...prev,
            currentPhase: 'connected'
          }));
        };

        // Handle incoming messages
        eventSource.onmessage = (event) => {
          try {
            console.log('📨 Received Deer SSE data:', event.data);
            const data = JSON.parse(event.data);
            
            // Handle different event types
            switch (data.type) {
              case 'ThoughtType.TOOL':
                console.log('🔧 Deer tool event received:', data);
                setStreamingState(prev => ({
                  ...prev,
                  thoughtSteps: [...prev.thoughtSteps, {
                    id: Date.now().toString(),
                    type: 'tool',
                    content: `Using ${data.payload?.tool || 'tool'}: ${data.payload?.query || data.payload?.url || 'Processing...'}`,
                    timestamp: new Date(),
                    metadata: data.payload
                  }],
                  currentPhase: 'using_tools'
                }));
                break;

              case 'ThoughtType.REASONING':
                console.log('🧠 Deer reasoning event received:', data);
                setStreamingState(prev => ({
                  ...prev,
                  currentReasoning: prev.currentReasoning + (data.payload?.token || data.payload || ''),
                  currentPhase: 'reasoning'
                }));
                break;

              case 'ThoughtType.VISIT':
                console.log('🌐 Deer visit event received:', data);
                setStreamingState(prev => ({
                  ...prev,
                  sources: [...prev.sources, {
                    url: data.payload?.url || 'Unknown URL',
                    title: data.payload?.title,
                    content: data.payload?.content || '',
                    timestamp: new Date()
                  }],
                  thoughtSteps: [...prev.thoughtSteps, {
                    id: Date.now().toString(),
                    type: 'visit',
                    content: `Visited: ${data.payload?.url || 'Unknown URL'}`,
                    timestamp: new Date(),
                    metadata: data.payload
                  }],
                  currentPhase: 'gathering_sources'
                }));
                break;

              case 'ThoughtType.WRITING_REPORT':
                console.log('📝 Deer writing report event received:', data);
                setStreamingState(prev => ({
                  ...prev,
                  finalAnswer: data.payload?.report || data.payload || '',
                  thoughtSteps: [...prev.thoughtSteps, {
                    id: Date.now().toString(),
                    type: 'writing_report',
                    content: 'Compiling final response...',
                    timestamp: new Date(),
                    metadata: data.payload
                  }],
                  currentPhase: 'writing_report'
                }));
                break;

              case 'complete':
                console.log('✅ Deer streaming completed');
                setStreamingState(prev => {
                  const updatedState = {
                    ...prev,
                    isStreaming: false,
                    currentPhase: 'completed'
                  };
                  
                  // Log the final state for debugging
                  console.log('📊 Final Deer state:', {
                    thoughtSteps: updatedState.thoughtSteps.length,
                    reasoning: updatedState.currentReasoning?.length || 0,
                    finalAnswer: updatedState.finalAnswer?.length || 0,
                    sources: updatedState.sources.length,
                    finalAnswerContent: updatedState.finalAnswer
                  });
                  
                  // Close connection and resolve promise with current state
                  cleanup();
                  if (promiseResolveRef.current) {
                    const result = {
                      thoughtSteps: updatedState.thoughtSteps,
                      reasoning: updatedState.currentReasoning,
                      finalAnswer: updatedState.finalAnswer,
                      sources: updatedState.sources
                    };
                    
                    console.log('🎯 Resolving Deer promise with:', result);
                    
                    // Validate that we have meaningful content
                    if (!result.finalAnswer || result.finalAnswer.trim().length === 0) {
                      console.warn('⚠️ Deer final answer is empty, using reasoning or fallback');
                      result.finalAnswer = result.reasoning || 'Research completed but no detailed response was generated.';
                    }
                    
                    promiseResolveRef.current(result);
                  }
                  
                  return updatedState;
                });
                break;

              default:
                console.log('❓ Unknown Deer event type received:', data.type, data);
                break;
            }
          } catch (error) {
            console.error('❌ Error parsing Deer SSE data:', error, 'Raw data:', event.data);
            setStreamingState(prev => ({
              ...prev,
              error: `Failed to parse response: ${error.message}`
            }));
          }
        };

        // Handle errors
        eventSource.onerror = (error) => {
          console.error('❌ Deer SSE connection error:', error);
          setStreamingState(prev => ({
            ...prev,
            isStreaming: false,
            error: 'Connection error occurred',
            currentPhase: 'error'
          }));
          
          cleanup();
          if (promiseRejectRef.current) {
            promiseRejectRef.current(new Error('Deer SSE connection failed'));
          }
        };

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
  }, [cleanup]);

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