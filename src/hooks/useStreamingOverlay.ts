import { useState, useCallback, useRef } from 'react';

export interface StreamingUpdate {
  type: string;
  message: string;
  timestamp: number;
  agentName?: string;
  sourceName?: string;
  progress?: number;
  agentNames?: string[];
  sourceCount?: number;
}

export interface StreamingState {
  isStreaming: boolean;
  updates: StreamingUpdate[];
  currentMessageId: string | null;
}

export const useStreamingOverlay = () => {
  const [streamingState, setStreamingState] = useState<StreamingState>({
    isStreaming: false,
    updates: [],
    currentMessageId: null
  });

  const streamingUpdateRef = useRef<(messageId: string, type: string, message: string, data?: any) => void>();

  const startStreaming = useCallback((messageId: string) => {
    setStreamingState({
      isStreaming: true,
      updates: [],
      currentMessageId: messageId
    });
  }, []);

  const addStreamingUpdate = useCallback((messageId: string, type: string, message: string, data?: any) => {
    setStreamingState(prev => {
      // Only add updates for the current streaming message
      if (prev.currentMessageId !== messageId) {
        return prev;
      }

      const newUpdate: StreamingUpdate = {
        type,
        message,
        timestamp: Date.now(),
        agentName: data?.agent_name,
        sourceName: data?.source_name,
        progress: data?.progress,
        agentNames: data?.agent_names,
        sourceCount: data?.source_count
      };

      return {
        ...prev,
        updates: [...prev.updates, newUpdate]
      };
    });
  }, []);

  const stopStreaming = useCallback(() => {
    // Clear streaming state after a short delay to allow final animation
    setTimeout(() => {
      setStreamingState({
        isStreaming: false,
        updates: [],
        currentMessageId: null
      });
    }, 2000);
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

  // Set up the streaming update callback
  streamingUpdateRef.current = addStreamingUpdate;

  return {
    streamingState,
    startStreaming,
    addStreamingUpdate,
    stopStreaming,
    isStreamingForMessage,
    getUpdatesForMessage,
    // Export the ref for use in useMessages hook
    streamingUpdateRef
  };
};
