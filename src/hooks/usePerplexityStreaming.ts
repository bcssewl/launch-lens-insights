import { useState, useCallback, useRef } from 'react';

interface StreamingEvent {
  type: 'stream_start' | 'agent_progress' | 'source_found' | 'content_chunk' | 'agent_collaboration' | 'research_complete' | 'error' | 
        // Legacy types for backward compatibility
        'search' | 'source' | 'snippet' | 'thought' | 'complete' | 'completion_start' | 'completion_chunk';
  timestamp: string;
  message: string;
  data?: {
    // Research and query data
    search_queries?: string[];
    query?: string;
    
    // Source information (from source_found events)
    source_name?: string;
    source_url?: string;
    source_type?: string;
    confidence?: number;
    credibility_score?: number; // 0.0-1.0 as per reference
    
    // Agent information
    agent_name?: string;
    agent_status?: 'active' | 'complete' | 'waiting' | 'error';
    agent_progress?: number;
    collaboration_mode?: 'sequential' | 'parallel' | 'hierarchical';
    
    // Content and completion
    snippet_text?: string;
    content?: string;
    chunk_index?: number;
    total_chunks?: number;
    total_sections?: number;
    
    // Progress and phases
    progress_percentage?: number;
    current_phase?: string;
    final_answer?: string;
    
    // Final results
    sources?: Array<{
      name: string;
      url: string;
      type: string;
      confidence: number;
      credibility_score?: number;
    }>;
    methodology?: string;
    analysis_depth?: string;
    
    // Error handling
    error_code?: string;
    error_message?: string;
    retry_after?: number;
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
  
  // Enhanced agent tracking
  activeAgents: Array<{
    name: string;
    status: 'active' | 'complete' | 'waiting' | 'error';
    progress: number;
  }>;
  collaborationMode: 'sequential' | 'parallel' | 'hierarchical' | null;
  
  // Enhanced error handling
  errorCode?: string;
  retryAfter?: number;
  
  // Chunked completion fields
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
    activeAgents: [],
    collaborationMode: null,
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
      activeAgents: [],
      collaborationMode: null,
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
        // New proper event types from the backend
        case 'stream_start':
          newState.isStreaming = true;
          newState.currentPhase = event.message || 'Starting research...';
          newState.progress = 5;
          console.log('🎬 Research stream started');
          break;

        case 'agent_progress':
          const agentName = event.data?.agent_name || 'Research Agent';
          const agentStatus = event.data?.agent_status || 'active';
          const agentProgress = event.data?.agent_progress || 0;
          
          newState.currentPhase = event.message || `${agentName} working...`;
          newState.progress = event.data?.progress_percentage || prev.progress + 5;
          
          // Update or add agent to tracking
          const existingAgentIndex = prev.activeAgents.findIndex(a => a.name === agentName);
          if (existingAgentIndex >= 0) {
            newState.activeAgents = [...prev.activeAgents];
            newState.activeAgents[existingAgentIndex] = { name: agentName, status: agentStatus, progress: agentProgress };
          } else {
            newState.activeAgents = [...prev.activeAgents, { name: agentName, status: agentStatus, progress: agentProgress }];
          }
          
          if (event.data?.collaboration_mode) {
            newState.collaborationMode = event.data.collaboration_mode;
          }
          
          console.log('👥 Agent progress:', { agentName, agentStatus, agentProgress });
          break;

        case 'source_found':
          const credibilityScore = event.data?.credibility_score || event.data?.confidence || 0.85;
          const sourceFoundName = event.data?.source_name || event.message;
          
          newState.currentPhase = `Found credible source: ${sourceFoundName}`;
          newState.progress = event.data?.progress_percentage || prev.progress + 10;
          
          if (sourceFoundName) {
            const newSource: SourceCardProps = {
              name: sourceFoundName,
              url: event.data?.source_url || '#',
              type: event.data?.source_type || 'Web Source',
              confidence: credibilityScore < 1 ? Math.round(credibilityScore * 100) : Math.round(credibilityScore)
            };
            console.log('🎯 High-quality source found:', newSource);
            newState.discoveredSources = [...prev.discoveredSources, newSource];
          }
          break;

        case 'agent_collaboration':
          newState.currentPhase = event.message || 'Agents collaborating...';
          newState.collaborationMode = event.data?.collaboration_mode || prev.collaborationMode;
          newState.progress = event.data?.progress_percentage || prev.progress + 5;
          console.log('🤝 Agent collaboration:', event.data?.collaboration_mode);
          break;

        case 'content_chunk':
          // Handle streaming content delivery
          newState.chunkedContent = prev.chunkedContent + (event.data?.content || '');
          newState.receivedChunks = prev.receivedChunks + 1;
          const contentChunkProgress = 80 + (event.data?.chunk_index || 0) / (event.data?.total_chunks || 1) * 15;
          newState.progress = Math.min(contentChunkProgress, 95);
          newState.currentPhase = `Delivering results (${event.data?.chunk_index + 1}/${event.data?.total_chunks})...`;
          console.log('📝 Content chunk received:', event.data?.chunk_index, 'of', event.data?.total_chunks);
          break;

        case 'research_complete':
          newState.isStreaming = false;
          newState.currentPhase = 'Research Complete';
          newState.progress = 100;
          
          // Use chunked content if available, otherwise use final answer
          const researchCompleteContent = prev.chunkedContent || event.data?.final_answer || event.message || '';
          newState.currentMessage = researchCompleteContent;
          
          // Mark all agents as complete
          newState.activeAgents = prev.activeAgents.map(agent => ({ ...agent, status: 'complete' as const }));
          
          if (event.data?.sources) {
            newState.discoveredSources = event.data.sources.map(source => ({
              ...source,
              confidence: source.credibility_score < 1 ? Math.round(source.credibility_score * 100) : Math.round(source.credibility_score || source.confidence)
            }));
          }
          
          console.log('✅ Research completed, final content length:', researchCompleteContent.length);
          console.log('📚 Final sources:', event.data?.sources?.length || 0);
          break;

        case 'error':
          newState.error = event.data?.error_message || event.message || 'An error occurred';
          newState.errorCode = event.data?.error_code;
          newState.retryAfter = event.data?.retry_after;
          newState.currentPhase = 'Error occurred';
          console.error('❌ Research error:', newState.error);
          break;

        // Legacy event types for backward compatibility
        case 'search':
          newState.currentPhase = event.message || 'Searching for information...';
          newState.progress = event.data?.progress_percentage || prev.progress + 10;
          if (event.data?.search_queries) {
            console.log('🔍 Adding search queries:', event.data.search_queries);
            newState.searchQueries = [...prev.searchQueries, ...event.data.search_queries];
          }
          break;

        case 'source':
          console.log('📚 Raw source event data:', {
            fullEvent: event,
            eventData: event.data,
            eventMessage: event.message,
            allFields: Object.keys(event.data || {})
          });
          
          // Use type assertion to access potentially unknown fields
          const sourceData = event.data as any;
          
          newState.currentPhase = `Analyzing source: ${sourceData?.source_name || sourceData?.name || 'Unknown'}`;
          newState.progress = sourceData?.progress_percentage || prev.progress + 15;
          
          // Try different possible field names for source data
          const sourceName = sourceData?.source_name || sourceData?.name || sourceData?.title || event.message;
          const sourceUrl = sourceData?.source_url || sourceData?.url || sourceData?.link || sourceData?.href;
          const sourceType = sourceData?.source_type || sourceData?.type || sourceData?.category || 'Web Source';
          const sourceConfidence = sourceData?.confidence || sourceData?.score || sourceData?.relevance;
          
          if (sourceName) {
            const newSource: SourceCardProps = {
              name: sourceName,
              url: sourceUrl || '#',
              type: sourceType,
              confidence: typeof sourceConfidence === 'number' 
                ? (sourceConfidence < 1 ? Math.round(sourceConfidence * 100) : Math.round(sourceConfidence))
                : 85
            };
            console.log('📚 Processed source for display:', newSource);
            newState.discoveredSources = [...prev.discoveredSources, newSource];
          } else {
            console.log('⚠️ No source name found in event data');
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
        const wsUrl = 'wss://ai-agent-research-optivise-production.up.railway.app/ws';
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
