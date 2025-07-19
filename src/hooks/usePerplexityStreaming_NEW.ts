import { useState, useCallback, useRef } from 'react';
import { detectAlgeonResearchType, type AlgeonResearchType } from '@/utils/algeonResearchTypes';

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
  researchType?: AlgeonResearchType;
  connectionId?: string;
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
    researchType: undefined,
    connectionId: undefined
  });

  const wsRef = useRef<WebSocket | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const resetState = useCallback(() => {
    console.log('🔄 Resetting Algeon streaming state');
    setStreamingState({
      isStreaming: false,
      currentPhase: '',
      progress: 0,
      sources: [],
      finalResponse: '',
      methodology: '',
      error: null,
      researchType: undefined,
      connectionId: undefined
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
          console.log('🔗 Algeon connection confirmed:', event.message);
          newState.isStreaming = true;
          newState.currentPhase = 'Connected to Algeon research engine';
          newState.progress = 10;
          newState.connectionId = event.connection_id;
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
    console.log('🚀 Starting Algeon streaming for query:', query.substring(0, 100));
    
    // Detect proper research type to prevent validation errors
    const researchType = detectAlgeonResearchType(query);
    console.log('📋 Using research type:', researchType);
    
    resetState();
    
    // Update state with research type
    setStreamingState(prev => ({
      ...prev,
      researchType,
      isStreaming: true,
      currentPhase: `Initializing ${researchType.replace('_', ' ')} research...`,
      progress: 5
    }));

    return new Promise((resolve, reject) => {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Increase timeout to 5 minutes for complex research to prevent premature closure
      timeoutRef.current = window.setTimeout(() => {
        console.log('⏰ Streaming timeout reached after 5 minutes');
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          console.log('🔌 Gracefully closing connection due to timeout');
          wsRef.current.close(1000, 'Timeout reached');
        }
        reject(new Error('Streaming timeout - research taking longer than expected'));
      }, 300000); // 5 minutes

      try {
        // Use the correct endpoint for Algeon API
        const wsUrl = 'wss://ai-agent-research-optivise-production.up.railway.app/api/research/stream';
        console.log('🔌 Connecting to Algeon API:', wsUrl);
        
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          console.log('✅ Algeon WebSocket connected successfully');
          
          // Send query with proper Algeon format including required research_type
          const payload = {
            query,
            research_type: researchType, // This prevents the validation error
            scope: 'global',
            depth: 'executive_summary',
            urgency: 'medium',
            stream: true,
            context: { sessionId }
          };
          
          console.log('📤 Sending Algeon payload:', { ...payload, query: payload.query.substring(0, 100) });
          
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(payload));
          } else {
            console.error('❌ WebSocket not ready when trying to send payload');
            reject(new Error('WebSocket connection not ready'));
          }
        };

        wsRef.current.onmessage = (event) => {
          try {
            console.log('📨 Raw Algeon message received:', event.data);
            const data: StreamingEvent = JSON.parse(event.data);
            console.log('📋 Parsed Algeon event:', {
              type: data.type,
              message: data.message?.substring(0, 100),
              data: data.data
            });
            
            handleStreamingEvent(data);

            // Resolve when we get the complete event
            if (data.type === 'complete') {
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }
              
              const finalAnswer = data.data?.final_answer || data.data?.content || 'Research completed successfully.';
              console.log('✅ Algeon streaming completed with response:', finalAnswer.substring(0, 100));
              
              // Don't close the connection immediately, let it close naturally
              setTimeout(() => {
                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                  wsRef.current.close(1000, 'Research complete');
                }
              }, 1000);
              
              resolve(finalAnswer);
            } else if (data.type === 'error') {
              console.error('❌ Algeon backend error:', data.message);
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }
              reject(new Error(data.message || 'Algeon backend error'));
            }
          } catch (error) {
            console.error('❌ Error parsing Algeon streaming event:', error);
            console.log('Raw event data:', event.data);
            // Don't reject here, continue processing other events
          }
        };

        wsRef.current.onerror = (error) => {
          console.error('❌ Algeon WebSocket error:', error);
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          setStreamingState(prev => ({
            ...prev,
            isStreaming: false,
            error: 'Connection failed'
          }));
          reject(new Error('Algeon WebSocket connection failed'));
        };

        wsRef.current.onclose = (event) => {
          console.log('🔌 Algeon WebSocket closed:', { 
            code: event.code, 
            reason: event.reason, 
            wasClean: event.wasClean 
          });
          
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          
          // Only reject if the close was unexpected (not code 1000 = normal closure)
          if (event.code !== 1000 && event.code !== 1001) {
            console.error('❌ Unexpected WebSocket closure:', event.code, event.reason);
            setStreamingState(prev => ({
              ...prev,
              isStreaming: false,
              error: `Connection closed unexpectedly: ${event.reason || 'Unknown reason'}`
            }));
            reject(new Error(`WebSocket closed unexpectedly: ${event.code} ${event.reason}`));
          }
        };

      } catch (error) {
        console.error('❌ Failed to establish Algeon WebSocket connection:', error);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        reject(error);
      }
    });
  }, [handleStreamingEvent, resetState]);

  const stopStreaming = useCallback(() => {
    console.log('🛑 Stopping Algeon streaming and resetting state');
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (wsRef.current) {
      // Check if connection is still open before trying to close
      if (wsRef.current.readyState === WebSocket.OPEN) {
        console.log('🔌 Gracefully closing WebSocket connection');
        wsRef.current.close(1000, 'User stopped streaming');
      }
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
