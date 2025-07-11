import { useState, useCallback, useRef } from 'react';

interface StreamingEvent {
  type: 'search' | 'source' | 'snippet' | 'thought' | 'complete' | 'completion_start' | 'completion_chunk';
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
    // New fields for chunked completion
    content?: string;
    chunk_index?: number;
    total_chunks?: number;
    total_sections?: number;
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
  // New fields for chunked completion
  chunkedContent: string;
  expectedChunks: number;
  receivedChunks: number;
}

export const usePerplexityStreaming = () => {
  const [streamingState, setStreamingState] = useState<StreamingState>({
    isStreaming: false,
    currentPhase: '',
    progress: 0,
    searchQueries: [],
    discoveredSources: [],
    currentMessage: '',
    chunkedContent: '',
    expectedChunks: 1,
    receivedChunks: 0
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
      currentMessage: '',
      chunkedContent: '',
      expectedChunks: 1,
      receivedChunks: 0
    });
  }, []);

  const handleStreamingEvent = useCallback((event: StreamingEvent) => {
    console.log('📡 Perplexity Streaming Event:', {
      type: event.type,
      message: event.message?.substring(0, 100),
      data: event.data,
      timestamp: event.timestamp
    });

    setStreamingState(prev => {
      const newState = { ...prev };

      switch (event.type) {
        case 'search':
          newState.currentPhase = event.message || 'Searching for information...';
          newState.progress = event.data?.progress_percentage || prev.progress + 10;
          if (event.data?.search_queries) {
            console.log('🔍 Adding search queries:', event.data.search_queries);
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
            console.log('📚 Adding new source:', newSource);
            newState.discoveredSources = [...prev.discoveredSources, newSource];
          }
          break;

        case 'snippet':
          newState.currentPhase = 'Analyzing relevant information...';
          newState.progress = event.data?.progress_percentage || prev.progress + 10;
          console.log('📄 Processing snippet:', event.data?.snippet_text?.substring(0, 100));
          break;

        case 'thought':
          newState.currentPhase = event.message || 'Processing insights...';
          newState.progress = event.data?.progress_percentage || prev.progress + 15;
          console.log('💭 AI thought:', event.message?.substring(0, 100));
          break;

        case 'completion_start':
          // Prepare for receiving chunked content
          newState.chunkedContent = '';
          newState.expectedChunks = event.data?.total_sections || 1;
          newState.receivedChunks = 0;
          newState.currentPhase = 'Finalizing analysis...';
          newState.progress = 90;
          console.log('🎬 Starting completion with', newState.expectedChunks, 'expected chunks');
          break;

        case 'completion_chunk':
          // Append chunk to accumulated content
          newState.chunkedContent = prev.chunkedContent + (event.data?.content || '');
          newState.receivedChunks = prev.receivedChunks + 1;
          const chunkProgress = 90 + (event.data?.chunk_index || 0) / (event.data?.total_chunks || 1) * 10;
          newState.progress = Math.min(chunkProgress, 99);
          newState.currentPhase = `Delivering section ${(event.data?.chunk_index || 0) + 1}...`;
          console.log('🧩 Received chunk', event.data?.chunk_index + 1, 'of', event.data?.total_chunks);
          console.log('📝 Chunk content length:', event.data?.content?.length || 0);
          console.log('📚 Total accumulated content length:', newState.chunkedContent.length);
          break;

        case 'complete':
          newState.isStreaming = false;
          newState.currentPhase = 'Complete';
          newState.progress = 100;
          // Use chunked content if available, otherwise use direct content
          const finalContent = prev.chunkedContent || event.data?.final_answer || event.message || '';
          newState.currentMessage = finalContent;
          console.log('✅ Final response length:', newState.currentMessage.length);
          console.log('📚 Final sources count:', event.data?.sources?.length || 0);
          console.log('🧩 Used chunked content:', !!prev.chunkedContent);
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
            console.log('📨 Raw WebSocket message received:', event.data);
            const data: StreamingEvent = JSON.parse(event.data);
            console.log('📋 Parsed streaming event:', {
              type: data.type,
              message: data.message?.substring(0, 100),
              data: data.data
            });
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
            console.error('❌ Error parsing WebSocket message:', error, 'Raw data:', event.data);
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
