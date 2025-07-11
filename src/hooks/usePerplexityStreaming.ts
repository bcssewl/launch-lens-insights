import { useState, useCallback, useRef } from 'react';

interface StreamingEvent {
  type: 'search' | 'source' | 'snippet' | 'thought' | 'complete';
  timestamp: string;
  message: string;
  data?: {
    search_queries?: string[];
    source_name?: string;
    source_url?: string;
    source_type?: string;
    confidence?: number;
    snippet_text?: string;
    progress_percentage?: number;
    current_phase?: string;
    final_answer?: string;
    sources?: Array<{
      name: string;
      url: string;
      type: string;
      confidence: number;
    }>;
    methodology?: string;
    analysis_depth?: string;
  };
}

interface SourceCardProps {
  name: string;
  url: string;
  type: string;
  confidence: number;
}

interface StreamingState {
  isStreaming: boolean;
  currentPhase: string;
  progress: number;
  searchQueries: string[];
  discoveredSources: SourceCardProps[];
  currentMessage: string;
  error?: string;
}

export const usePerplexityStreaming = () => {
  const [streamingState, setStreamingState] = useState<StreamingState>({
    isStreaming: false,
    currentPhase: '',
    progress: 0,
    searchQueries: [],
    discoveredSources: [],
    currentMessage: ''
  });

  const wsRef = useRef<WebSocket | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetState = useCallback(() => {
    setStreamingState({
      isStreaming: false,
      currentPhase: '',
      progress: 0,
      searchQueries: [],
      discoveredSources: [],
      currentMessage: ''
    });
  }, []);

  const handleStreamingEvent = useCallback((event: StreamingEvent) => {
    console.log('📡 Perplexity Streaming Event:', event);

    setStreamingState(prev => {
      const newState = { ...prev };

      switch (event.type) {
        case 'search':
          newState.currentPhase = event.message || 'Searching for information...';
          newState.progress = event.data?.progress_percentage || prev.progress + 10;
          if (event.data?.search_queries) {
            newState.searchQueries = [...prev.searchQueries, ...event.data.search_queries];
          }
          break;

        case 'source':
          newState.currentPhase = `Analyzing source: ${event.data?.source_name || 'Unknown'}`;
          newState.progress = event.data?.progress_percentage || prev.progress + 15;
          if (event.data?.source_name) {
            const newSource: SourceCardProps = {
              name: event.data.source_name,
              url: event.data.source_url || '',
              type: event.data.source_type || 'Web Source',
              confidence: event.data.confidence || 85
            };
            newState.discoveredSources = [...prev.discoveredSources, newSource];
          }
          break;

        case 'snippet':
          newState.currentPhase = 'Analyzing relevant information...';
          newState.progress = event.data?.progress_percentage || prev.progress + 10;
          break;

        case 'thought':
          newState.currentPhase = event.message || 'Processing insights...';
          newState.progress = event.data?.progress_percentage || prev.progress + 15;
          break;

        case 'complete':
          newState.isStreaming = false;
          newState.currentPhase = 'Complete';
          newState.progress = 100;
          newState.currentMessage = event.data?.final_answer || event.message || '';
          if (event.data?.sources) {
            newState.discoveredSources = event.data.sources;
          }
          break;
      }

      return newState;
    });
  }, []);

  const startStreaming = useCallback(async (query: string, sessionId: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      console.log('🚀 Starting Perplexity-style streaming for:', query);
      
      resetState();
      setStreamingState(prev => ({ ...prev, isStreaming: true }));

      // Setup connection timeout (45 seconds)
      timeoutRef.current = setTimeout(() => {
        console.error('⏰ WebSocket timeout after 45 seconds');
        if (wsRef.current) {
          wsRef.current.close();
        }
        setStreamingState(prev => ({ ...prev, error: 'Connection timeout' }));
        reject(new Error('Streaming timeout - falling back to REST API'));
      }, 45000);

      try {
        const wsUrl = 'wss://ai-agent-research-optivise-production.up.railway.app/stream';
        console.log('🔌 Connecting to:', wsUrl);
        
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          console.log('✅ WebSocket connected');
          
          const payload = {
            query,
            context: { sessionId }
          };
          
          console.log('📤 Sending payload:', payload);
          wsRef.current?.send(JSON.stringify(payload));
        };

        wsRef.current.onmessage = (event) => {
          try {
            const data: StreamingEvent = JSON.parse(event.data);
            handleStreamingEvent(data);

            // If complete, resolve with the final answer
            if (data.type === 'complete') {
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
              }
              const finalAnswer = data.data?.final_answer || data.message || 'Research completed';
              console.log('✅ Streaming complete, resolving with:', finalAnswer.substring(0, 100));
              resolve(finalAnswer);
            }
          } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error);
            setStreamingState(prev => ({ ...prev, error: 'Message parsing error' }));
          }
        };

        wsRef.current.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          setStreamingState(prev => ({ ...prev, error: 'Connection error' }));
          reject(new Error('WebSocket connection failed'));
        };

        wsRef.current.onclose = (event) => {
          console.log('🔌 WebSocket closed:', event.code, event.reason);
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          
          // Only reject if we haven't resolved yet
          if (streamingState.isStreaming) {
            setStreamingState(prev => ({ ...prev, isStreaming: false }));
            reject(new Error('WebSocket connection closed unexpectedly'));
          }
        };

      } catch (error) {
        console.error('❌ WebSocket setup error:', error);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        setStreamingState(prev => ({ ...prev, error: 'Setup error' }));
        reject(error);
      }
    });
  }, [handleStreamingEvent, resetState, streamingState.isStreaming]);

  const stopStreaming = useCallback(() => {
    console.log('🛑 Stopping streaming');
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setStreamingState(prev => ({ ...prev, isStreaming: false }));
  }, []);

  return {
    streamingState,
    startStreaming,
    stopStreaming,
    resetState
  };
};
