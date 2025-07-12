import { useState, useCallback, useRef } from 'react';

// Configuration constants
const STREAMING_TIMEOUT_MS = 300000; // 5 minutes for complex research and report generation

interface StreamingEvent {
  type: 'connection_confirmed' | 'search' | 'thought' | 'source' | 'snippet' | 'complete' | 'error';
  timestamp: string;
  message: string;
  connection_id?: string;
  data?: {
    // Search data
    search_queries?: string[];
    progress_percentage?: number;
    current_phase?: string;
    
    // Source information
    source_name?: string;
    source_url?: string;
    source_type?: string;
    confidence?: number;
    
    // Content and completion
    snippet_text?: string;
    content?: string;
    final_answer?: string;
    
    // Final results
    sources?: Array<{
      name: string;
      url: string;
      type: string;
      confidence: number;
    }>;
    methodology?: string;
    
    // Error handling
    error_code?: string;
    retry_suggested?: boolean;
  };
}

interface Source {
  name: string;
  url: string;
  type: string;
  confidence: number;
}

interface StreamingState {
  isStreaming: boolean;
  currentPhase: string;
  progress: number;
  sources: Source[];
  finalResponse: string;
  methodology: string;
  error: string | null;
  errorCode?: string;
  retryAfter?: number;
  searchQueries: string[];
  discoveredSources: Source[];
  activeAgents?: string[];
  collaborationMode?: string;
}

export const usePerplexityStreaming = () => {
  const [streamingState, setStreamingState] = useState<StreamingState>({
    isStreaming: false,
    currentPhase: '',
    progress: 0,
    sources: [],
    finalResponse: '',
    methodology: '',
    error: null,
    searchQueries: [],
    discoveredSources: []
  });

  const wsRef = useRef<WebSocket | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const resetState = useCallback(() => {
    console.log('🔄 Resetting streaming state');
    setStreamingState({
      isStreaming: false,
      currentPhase: '',
      progress: 0,
      sources: [],
      finalResponse: '',
      methodology: '',
      error: null,
      searchQueries: [],
      discoveredSources: []
    });
  }, []);

  const handleStreamingEvent = useCallback((event: StreamingEvent) => {
    console.log('📨 Processing streaming event:', {
      type: event.type,
      message: event.message?.substring(0, 100),
      timestamp: event.timestamp
    });

    setStreamingState(prev => {
      const newState = { ...prev };

      switch (event.type) {
        case 'connection_confirmed':
          console.log('🔗 Connection confirmed:', event.message);
          newState.isStreaming = true;
          newState.currentPhase = 'Connected to Stratix backend';
          newState.progress = 5;
          break;

        case 'search':
          console.log('🔍 Starting research:', event.message);
          newState.currentPhase = event.message || 'Searching for information...';
          newState.progress = event.data?.progress_percentage || 15;
          break;

        case 'thought':
          console.log('💭 AI thinking:', event.message);
          newState.currentPhase = event.message || 'Analyzing information...';
          newState.progress = event.data?.progress_percentage || 40;
          break;

        case 'source':
          console.log('📄 Source found:', event.data?.source_name);
          if (event.data?.source_name && event.data?.source_url) {
            const sourceInfo: Source = {
              name: event.data.source_name,
              url: event.data.source_url,
              type: event.data.source_type || 'web',
              confidence: event.data.confidence || 0.85
            };
            newState.sources = [...prev.sources, sourceInfo];
          }
          newState.currentPhase = `Found source: ${event.data?.source_name || 'New source'}`;
          newState.progress = event.data?.progress_percentage || 60;
          break;

        case 'snippet':
          console.log('📝 Content analysis:', event.message);
          newState.currentPhase = event.message || 'Analyzing content...';
          newState.progress = event.data?.progress_percentage || 80;
          break;

        case 'complete':
          console.log('✅ Research complete');
          newState.isStreaming = false;
          newState.currentPhase = 'Research completed';
          newState.progress = 100;
          
          if (event.data?.final_answer) {
            newState.finalResponse = event.data.final_answer;
          }
          
          if (event.data?.sources) {
            newState.sources = event.data.sources;
          }
          
          if (event.data?.methodology) {
            newState.methodology = event.data.methodology;
          }
          break;

        case 'error':
          console.error('❌ Streaming error:', event.message);
          newState.isStreaming = false;
          newState.error = event.message || 'An error occurred during streaming';
          newState.currentPhase = 'Error occurred';
          break;

        default:
          console.warn('⚠️ Unknown event type:', event.type);
      }

      return newState;
    });
  }, []);

  const startStreaming = useCallback(async (query: string, sessionId: string): Promise<string> => {
    console.log('🚀 Starting Perplexity-style streaming for query:', query);
    
    resetState();

    return new Promise((resolve, reject) => {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Set timeout for the streaming request (300 seconds for complex research)
      timeoutRef.current = window.setTimeout(() => {
        console.log('⏰ Streaming timeout reached after 5 minutes');
        if (wsRef.current) {
          wsRef.current.close();
        }
        reject(new Error('Streaming timeout - falling back to REST API'));
      }, STREAMING_TIMEOUT_MS);

      try {
        const wsUrl = 'wss://ai-agent-research-optivise-production.up.railway.app/stream';
        console.log('🔌 Connecting to:', wsUrl);
        
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          console.log('✅ WebSocket connected');
          
          // Send query with exact backend format
          const payload = {
            query,
            context: { sessionId }
          };
          
          console.log('📤 Sending payload:', payload);
          wsRef.current?.send(JSON.stringify(payload));
        };

        wsRef.current.onmessage = (event) => {
          try {
            console.log('📨 Raw WebSocket message received:', event.data);
            const data: StreamingEvent = JSON.parse(event.data);
            console.log('📋 Parsed streaming event:', {
              type: data.type,
              message: data.message?.substring(0, 100),
              data: data.data
            });
            handleStreamingEvent(data);

            // Resolve when we get the complete event
            if (data.type === 'complete') {
              clearTimeout(timeoutRef.current!);
              timeoutRef.current = null;
              
              const finalAnswer = data.data?.final_answer || 'Research completed successfully.';
              console.log('✅ Streaming completed with response:', finalAnswer.substring(0, 100));
              resolve(finalAnswer);
            }
          } catch (error) {
            console.error('❌ Error parsing streaming event:', error);
            console.log('Raw event data:', event.data);
          }
        };

        wsRef.current.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          clearTimeout(timeoutRef.current!);
          timeoutRef.current = null;
          reject(new Error('WebSocket connection failed'));
        };

        wsRef.current.onclose = (event) => {
          console.log('🔌 WebSocket closed:', event.code, event.reason);
          clearTimeout(timeoutRef.current!);
          timeoutRef.current = null;
          
          if (event.code !== 1000) {
            // Unexpected close
            reject(new Error(`WebSocket closed unexpectedly: ${event.code} ${event.reason}`));
          }
        };

      } catch (error) {
        console.error('❌ Failed to establish WebSocket connection:', error);
        clearTimeout(timeoutRef.current!);
        timeoutRef.current = null;
        reject(error);
      }
    });
  }, [handleStreamingEvent, resetState]);

  const stopStreaming = useCallback(() => {
    console.log('🛑 Stopping streaming and resetting state');
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    // Fully reset the streaming state to prevent interference
    resetState();
  }, [resetState]);

  return {
    streamingState,
    startStreaming,
    stopStreaming,
    resetState
  };
};
