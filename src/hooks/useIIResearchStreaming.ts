import { useState, useRef, useCallback, useEffect } from 'react';

export interface ThoughtStep {
  id: string;
  type: 'tool' | 'reasoning' | 'visit' | 'writing_report';
  content: string;
  timestamp: Date;
  metadata?: any;
}

export interface Source {
  url: string;
  title?: string;
  content: string;
  timestamp: Date;
}

export interface IIResearchStreamingState {
  isStreaming: boolean;
  thoughtSteps: ThoughtStep[];
  currentReasoning: string;
  finalAnswer: string;
  sources: Source[];
  error: string | null;
  currentPhase: string;
}

const INITIAL_STATE: IIResearchStreamingState = {
  isStreaming: false,
  thoughtSteps: [],
  currentReasoning: '',
  finalAnswer: '',
  sources: [],
  error: null,
  currentPhase: 'idle'
};

export const useIIResearchStreaming = () => {
  const [streamingState, setStreamingState] = useState<IIResearchStreamingState>(INITIAL_STATE);
  const eventSourceRef = useRef<EventSource | null>(null);
  const promiseResolveRef = useRef<((result: any) => void) | null>(null);
  const promiseRejectRef = useRef<((error: any) => void) | null>(null);

  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      console.log('🧹 Cleaning up II-Research EventSource connection');
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  const resetState = useCallback(() => {
    console.log('🔄 Resetting II-Research streaming state');
    cleanup();
    setStreamingState(INITIAL_STATE);
    promiseResolveRef.current = null;
    promiseRejectRef.current = null;
  }, [cleanup]);

  const startStreaming = useCallback((question: string): Promise<any> => {
    console.log('🚀 Starting II-Research streaming for question:', question);
    
    return new Promise((resolve, reject) => {
      // Store promise handlers
      promiseResolveRef.current = resolve;
      promiseRejectRef.current = reject;

      // Reset state
      setStreamingState(INITIAL_STATE);

      try {
        // Encode the question for URL
        const encodedQuestion = encodeURIComponent(question);
        const url = `https://ii-researcher-3-deer-agent.up.railway.app/search?question=${encodedQuestion}&is_reasoning=true`;
        
        console.log('🔗 Connecting to II-Research SSE endpoint:', url);
        
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
          console.log('✅ II-Research SSE connection opened');
          setStreamingState(prev => ({
            ...prev,
            currentPhase: 'connected'
          }));
        };

        // Handle incoming messages
        eventSource.onmessage = (event) => {
          try {
            console.log('📨 Received SSE data:', event.data);
            const data = JSON.parse(event.data);
            
            // Handle different event types
            switch (data.type) {
              case 'ThoughtType.TOOL':
                console.log('🔧 Tool event received:', data);
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
                console.log('🧠 Reasoning event received:', data);
                setStreamingState(prev => ({
                  ...prev,
                  currentReasoning: prev.currentReasoning + (data.payload?.token || data.payload || ''),
                  currentPhase: 'reasoning'
                }));
                break;

              case 'ThoughtType.VISIT':
                console.log('🌐 Visit event received:', data);
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
                console.log('📝 Writing report event received:', data);
                setStreamingState(prev => ({
                  ...prev,
                  finalAnswer: data.payload?.report || data.payload || '',
                  thoughtSteps: [...prev.thoughtSteps, {
                    id: Date.now().toString(),
                    type: 'writing_report',
                    content: 'Compiling final research report...',
                    timestamp: new Date(),
                    metadata: data.payload
                  }],
                  currentPhase: 'writing_report'
                }));
                break;

              case 'complete':
                console.log('✅ II-Research streaming completed');
                setStreamingState(prev => ({
                  ...prev,
                  isStreaming: false,
                  currentPhase: 'completed'
                }));
                
                // Close connection and resolve promise
                cleanup();
                if (promiseResolveRef.current) {
                  promiseResolveRef.current({
                    thoughtSteps: streamingState.thoughtSteps,
                    reasoning: streamingState.currentReasoning,
                    finalAnswer: streamingState.finalAnswer,
                    sources: streamingState.sources
                  });
                }
                break;

              default:
                console.log('❓ Unknown event type received:', data.type, data);
                break;
            }
          } catch (error) {
            console.error('❌ Error parsing SSE data:', error, 'Raw data:', event.data);
            setStreamingState(prev => ({
              ...prev,
              error: `Failed to parse response: ${error.message}`
            }));
          }
        };

        // Handle errors
        eventSource.onerror = (error) => {
          console.error('❌ II-Research SSE connection error:', error);
          setStreamingState(prev => ({
            ...prev,
            isStreaming: false,
            error: 'Connection error occurred',
            currentPhase: 'error'
          }));
          
          cleanup();
          if (promiseRejectRef.current) {
            promiseRejectRef.current(new Error('SSE connection failed'));
          }
        };

      } catch (error) {
        console.error('❌ Failed to start II-Research streaming:', error);
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
    console.log('⏹️ Manually stopping II-Research streaming');
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
      console.log('🧹 Component unmounting, cleaning up II-Research streaming');
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