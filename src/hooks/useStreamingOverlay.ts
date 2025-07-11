
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
    console.log('🎬 StreamingOverlay: STARTING streaming for message:', messageId);
    setStreamingState(prev => {
      const newState = {
        isStreaming: true,
        updates: [],
        currentMessageId: messageId,
        sources: [],
        currentPhase: 'initializing',
        progress: 5
      };
      console.log('🎬 StreamingOverlay: NEW streaming state set:', newState);
      return newState;
    });
  }, []);

  const addStreamingUpdate = useCallback((messageId: string, type: string, message: string, data?: any) => {
    console.log('📡 StreamingOverlay: Adding update for message:', messageId, 'type:', type, 'message:', message);
    
    setStreamingState(prev => {
      console.log('🔍 StreamingOverlay: Current state before update:', {
        currentMessageId: prev.currentMessageId,
        isStreaming: prev.isStreaming,
        updatesCount: prev.updates.length
      });
      
      // CRITICAL FIX: Don't ignore updates if currentMessageId doesn't match initially
      // This can happen due to timing issues, so we'll be more permissive
      if (prev.currentMessageId !== messageId && prev.currentMessageId !== null) {
        console.log('⚠️ StreamingOverlay: Message ID mismatch but continuing, prev:', prev.currentMessageId, 'new:', messageId);
      }

      // If this is the first update and we don't have a currentMessageId, set it
      if (!prev.currentMessageId && messageId) {
        console.log('🔧 StreamingOverlay: Setting currentMessageId from first update:', messageId);
      }

      const normalizedType = type.toLowerCase() as StreamingUpdate['type'];
      console.log('🔄 StreamingOverlay: Normalized type:', normalizedType);

      const newUpdate: StreamingUpdate = {
        type: normalizedType,
        message,
        timestamp: Date.now(),
        data
      };

      // Update sources array when source event is received
      let newSources = [...prev.sources];
      if (normalizedType === 'source' && data?.source_name && data?.source_url) {
        const existingSource = newSources.find(s => s.url === data.source_url);
        if (!existingSource) {
          newSources.push({
            name: data.source_name,
            url: data.source_url,
            type: data.source_type || 'article',
            confidence: data.confidence
          });
          console.log('🔗 StreamingOverlay: Added new source:', data.source_name);
        }
      }

      // Update current phase and progress
      let currentPhase = prev.currentPhase;
      let progress = prev.progress;
      
      switch (normalizedType) {
        case 'search':
          currentPhase = 'searching';
          progress = Math.max(progress, 15);
          break;
        case 'source':
          currentPhase = 'discovering';
          progress = Math.max(progress, Math.min(progress + 15, 60));
          break;
        case 'snippet':
          currentPhase = 'analyzing';
          progress = Math.max(progress, Math.min(progress + 10, 80));
          break;
        case 'thought':
          currentPhase = 'synthesizing';
          progress = Math.max(progress, data?.progress_percentage || Math.min(progress + 5, 95));
          break;
        case 'complete':
          currentPhase = 'complete';
          progress = 100;
          if (data?.sources) {
            newSources = data.sources;
          }
          break;
      }

      const newState = {
        ...prev,
        currentMessageId: prev.currentMessageId || messageId, // Ensure we have a messageId
        updates: [...prev.updates, newUpdate],
        sources: newSources,
        currentPhase,
        progress,
        isStreaming: normalizedType !== 'complete' // Keep streaming until complete
      };

      console.log('✅ StreamingOverlay: Updated state:', {
        messageId: newState.currentMessageId,
        updateCount: newState.updates.length,
        currentPhase: newState.currentPhase,
        progress: newState.progress,
        sourcesCount: newState.sources.length,
        isStreaming: newState.isStreaming
      });

      return newState;
    });
  }, []);

  const stopStreaming = useCallback(() => {
    console.log('🛑 StreamingOverlay: Stopping streaming');
    setStreamingState(prev => ({
      ...prev,
      isStreaming: false,
      currentPhase: 'complete',
      progress: 100
    }));
    
    // Clear streaming state after a delay to allow final animation
    setTimeout(() => {
      console.log('🧹 StreamingOverlay: Cleaning up streaming state');
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
    // DEFENSIVE CHECK: Also return true if we have updates for this message
    const hasUpdates = streamingState.updates.length > 0 && 
                      (streamingState.currentMessageId === messageId || !streamingState.currentMessageId);
    const isStreaming = streamingState.isStreaming && streamingState.currentMessageId === messageId;
    const result = isStreaming || hasUpdates;
    
    console.log('🤔 StreamingOverlay: isStreamingForMessage check:', {
      messageId,
      currentMessageId: streamingState.currentMessageId,
      isStreaming: streamingState.isStreaming,
      hasUpdates,
      result
    });
    
    return result;
  }, [streamingState.isStreaming, streamingState.currentMessageId, streamingState.updates]);

  const getUpdatesForMessage = useCallback((messageId: string) => {
    // DEFENSIVE: Return updates if we have them, even if currentMessageId doesn't match exactly
    if (streamingState.currentMessageId === messageId || 
        (streamingState.updates.length > 0 && !streamingState.currentMessageId)) {
      console.log('📋 StreamingOverlay: Getting updates for message:', messageId, 'count:', streamingState.updates.length);
      return streamingState.updates;
    }
    console.log('📋 StreamingOverlay: No updates for message:', messageId, 'currentMessageId:', streamingState.currentMessageId);
    return [];
  }, [streamingState.currentMessageId, streamingState.updates]);

  const getSourcesForMessage = useCallback((messageId: string) => {
    if (streamingState.currentMessageId === messageId || 
        (streamingState.sources.length > 0 && !streamingState.currentMessageId)) {
      console.log('🔗 StreamingOverlay: Getting sources for message:', messageId, 'count:', streamingState.sources.length);
      return streamingState.sources;
    }
    return [];
  }, [streamingState.currentMessageId, streamingState.sources]);

  const getProgressForMessage = useCallback((messageId: string) => {
    if (streamingState.currentMessageId === messageId || 
        (streamingState.progress > 0 && !streamingState.currentMessageId)) {
      const progress = {
        phase: streamingState.currentPhase,
        progress: streamingState.progress
      };
      console.log('📊 StreamingOverlay: Getting progress for message:', messageId, progress);
      return progress;
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
    streamingUpdateRef
  };
};
