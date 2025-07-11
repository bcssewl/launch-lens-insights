
import { useState, useCallback, useRef } from 'react';

export interface StreamingUpdate {
  type: 'search' | 'source' | 'snippet' | 'thought' | 'complete';
  message: string;
  timestamp: number;
  data?: {
    source_name?: string;
    source_url?: string;
    snippet_text?: string;
    confidence?: number;
    progress_percentage?: number;
    agent_name?: string;
    search_queries?: string[];
    source_type?: 'article' | 'research' | 'news' | 'academic';
    sources?: Array<{
      name: string;
      url: string;
      type?: string;
    }>;
  };
}

export interface StreamingState {
  isStreaming: boolean;
  updates: StreamingUpdate[];
  currentMessageId: string | null;
  sources: Array<{
    name: string;
    url: string;
    type?: string;
    confidence?: number;
  }>;
  currentPhase: string;
  progress: number;
}

export const useStreamingOverlay = () => {
  const [streamingState, setStreamingState] = useState<StreamingState>({
    isStreaming: false,
    updates: [],
    currentMessageId: null,
    sources: [],
    currentPhase: '',
    progress: 0
  });

  const streamingUpdateRef = useRef<(messageId: string, type: string, message: string, data?: any) => void>();

  const startStreaming = useCallback((messageId: string) => {
    setStreamingState({
      isStreaming: true,
      updates: [],
      currentMessageId: messageId,
      sources: [],
      currentPhase: 'initializing',
      progress: 0
    });
  }, []);

  const addStreamingUpdate = useCallback((messageId: string, type: string, message: string, data?: any) => {
    setStreamingState(prev => {
      // Only add updates for the current streaming message
      if (prev.currentMessageId !== messageId) {
        return prev;
      }

      const streamingType = type as StreamingUpdate['type'];
      const newUpdate: StreamingUpdate = {
        type: streamingType,
        message,
        timestamp: Date.now(),
        data
      };

      // Update sources array when source event is received
      let newSources = [...prev.sources];
      if (streamingType === 'source' && data?.source_name && data?.source_url) {
        const existingSource = newSources.find(s => s.url === data.source_url);
        if (!existingSource) {
          newSources.push({
            name: data.source_name,
            url: data.source_url,
            type: data.source_type || 'article',
            confidence: data.confidence
          });
        }
      }

      // Update current phase and progress
      let currentPhase = prev.currentPhase;
      let progress = prev.progress;
      
      switch (streamingType) {
        case 'search':
          currentPhase = 'searching';
          progress = 10;
          break;
        case 'source':
          currentPhase = 'discovering';
          progress = Math.min(progress + 15, 60);
          break;
        case 'snippet':
          currentPhase = 'analyzing';
          progress = Math.min(progress + 10, 80);
          break;
        case 'thought':
          currentPhase = 'synthesizing';
          progress = data?.progress_percentage || Math.min(progress + 5, 95);
          break;
        case 'complete':
          currentPhase = 'complete';
          progress = 100;
          // Add final sources if provided
          if (data?.sources) {
            newSources = data.sources;
          }
          break;
      }

      return {
        ...prev,
        updates: [...prev.updates, newUpdate],
        sources: newSources,
        currentPhase,
        progress
      };
    });
  }, []);

  const stopStreaming = useCallback(() => {
    // Clear streaming state after a short delay to allow final animation
    setTimeout(() => {
      setStreamingState({
        isStreaming: false,
        updates: [],
        currentMessageId: null,
        sources: [],
        currentPhase: '',
        progress: 0
      });
    }, 3000);
  }, []);

  const isStreamingForMessage = useCallback((messageId: string) => {
    return streamingState.isStreaming && streamingState.currentMessageId === messageId;
  }, [streamingState.isStreaming, streamingState.currentMessageId]);

  const getUpdatesForMessage = useCallback((messageId: string) => {
    if (streamingState.currentMessageId === messageId) {
      return streamingState.updates;
    }
    return [];
  }, [streamingState.currentMessageId, streamingState.updates]);

  const getSourcesForMessage = useCallback((messageId: string) => {
    if (streamingState.currentMessageId === messageId) {
      return streamingState.sources;
    }
    return [];
  }, [streamingState.currentMessageId, streamingState.sources]);

  const getProgressForMessage = useCallback((messageId: string) => {
    if (streamingState.currentMessageId === messageId) {
      return {
        phase: streamingState.currentPhase,
        progress: streamingState.progress
      };
    }
    return { phase: '', progress: 0 };
  }, [streamingState.currentMessageId, streamingState.currentPhase, streamingState.progress]);

  // Set up the streaming update callback
  streamingUpdateRef.current = addStreamingUpdate;

  return {
    streamingState,
    startStreaming,
    addStreamingUpdate,
    stopStreaming,
    isStreamingForMessage,
    getUpdatesForMessage,
    getSourcesForMessage,
    getProgressForMessage,
    // Export the ref for use in useMessages hook
    streamingUpdateRef
  };
};
