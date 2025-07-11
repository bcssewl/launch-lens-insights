
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

  // CRITICAL FIX: Use refs for immediate synchronous access
  const currentMessageIdRef = useRef<string | null>(null);
  const isStreamingRef = useRef<boolean>(false);
  const updatesRef = useRef<StreamingUpdate[]>([]);
  const sourcesRef = useRef<Array<{ name: string; url: string; type?: string; confidence?: number }>>([]);
  const streamingUpdatesRef = useRef<Record<string, StreamingUpdate[]>>({});

  const startStreaming = useCallback((messageId: string) => {
    console.log('🎬 StreamingOverlay: STARTING streaming for message:', messageId);
    
    // CRITICAL FIX: Set ref values SYNCHRONOUSLY first
    currentMessageIdRef.current = messageId;
    isStreamingRef.current = true;
    updatesRef.current = [];
    sourcesRef.current = [];
    
    // Then update state asynchronously
    setStreamingState({
      isStreaming: true,
      updates: [],
      currentMessageId: messageId,
      sources: [],
      currentPhase: 'initializing',
      progress: 5
    });
    
    console.log('🎬 StreamingOverlay: Started streaming for message:', messageId);
  }, []);

  const addStreamingUpdate = useCallback((messageId: string, type: string, message: string, data?: any) => {
    console.log('📡 StreamingOverlay: Adding update for message:', messageId, 'type:', type);
    
    // DEFENSIVE CHECK: Use ref values as primary source of truth
    const currentId = currentMessageIdRef.current;
    const isCurrentlyStreaming = isStreamingRef.current;
    
    // DEFENSIVE: If we have a messageId but no current ID in ref, set it
    if (messageId && !currentId && isCurrentlyStreaming) {
      console.log('🔧 StreamingOverlay: Setting currentMessageId from update:', messageId);
      currentMessageIdRef.current = messageId;
    }
    
    // Only process if we're streaming for this message or no specific message is set
    const effectiveMessageId = currentId || messageId;
    if (!isCurrentlyStreaming && !messageId) {
      console.warn('⚠️ StreamingOverlay: Not streaming and no messageId provided');
      return;
    }

    const normalizedType = type.toLowerCase() as StreamingUpdate['type'];
    const newUpdate: StreamingUpdate = {
      type: normalizedType,
      message,
      timestamp: Date.now(),
      data
    };

    // Update refs immediately (synchronous)
    updatesRef.current = [...updatesRef.current, newUpdate];
    
    // Also store in message-specific updates
    if (!streamingUpdatesRef.current[effectiveMessageId]) {
      streamingUpdatesRef.current[effectiveMessageId] = [];
    }
    streamingUpdatesRef.current[effectiveMessageId] = [...streamingUpdatesRef.current[effectiveMessageId], newUpdate];

    // Update sources ref if needed
    if (normalizedType === 'source' && data?.source_name && data?.source_url) {
      const existingSource = sourcesRef.current.find(s => s.url === data.source_url);
      if (!existingSource) {
        sourcesRef.current = [...sourcesRef.current, {
          name: data.source_name,
          url: data.source_url,
          type: data.source_type || 'article',
          confidence: data.confidence
        }];
      }
    }

    // Add complete event sources to refs
    if (normalizedType === 'complete' && data?.sources) {
      sourcesRef.current = data.sources;
    }

    // Calculate progress
    let currentPhase = 'initializing';
    let progress = 5;
    
    switch (normalizedType) {
      case 'search':
        currentPhase = 'searching';
        progress = Math.max(15, data?.progress_percentage || 15);
        break;
      case 'source':
        currentPhase = 'discovering';
        progress = Math.max(30, data?.progress_percentage || 45);
        break;
      case 'snippet':
        currentPhase = 'analyzing';
        progress = Math.max(50, data?.progress_percentage || 65);
        break;
      case 'thought':
        currentPhase = 'synthesizing';
        progress = Math.max(70, data?.progress_percentage || 85);
        break;
      case 'complete':
        currentPhase = 'complete';
        progress = 100;
        isStreamingRef.current = false;
        break;
    }

    // Update state asynchronously
    setStreamingState(prev => ({
      ...prev,
      currentMessageId: effectiveMessageId,
      updates: [...updatesRef.current],
      sources: [...sourcesRef.current],
      currentPhase,
      progress,
      isStreaming: normalizedType !== 'complete'
    }));

    console.log('✅ StreamingOverlay: Updated state for message:', effectiveMessageId, 'updates:', updatesRef.current.length);
  }, []);

  const stopStreaming = useCallback(() => {
    console.log('🛑 StreamingOverlay: Stopping streaming');
    isStreamingRef.current = false;
    
    setStreamingState(prev => ({
      ...prev,
      isStreaming: false,
      currentPhase: 'complete',
      progress: 100
    }));
    
    // Clear refs and state after a delay
    setTimeout(() => {
      console.log('🧹 StreamingOverlay: Cleaning up streaming state');
      currentMessageIdRef.current = null;
      updatesRef.current = [];
      sourcesRef.current = [];
      
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
    // IMPROVED: Check both refs and state for comprehensive coverage
    const currentIdRef = currentMessageIdRef.current;
    const isStreamingFromRef = isStreamingRef.current;
    const hasUpdatesInRef = updatesRef.current.length > 0;
    
    const isCurrentMessage = currentIdRef === messageId || streamingState.currentMessageId === messageId;
    const hasUpdates = hasUpdatesInRef || streamingState.updates.length > 0;
    const isStreaming = isStreamingFromRef || streamingState.isStreaming;
    
    // Return true if we're actively streaming for this message OR if we have updates for it
    const result = (isStreaming && isCurrentMessage) || (hasUpdates && isCurrentMessage);
    
    console.log('🤔 StreamingOverlay: isStreamingForMessage check:', {
      messageId,
      currentIdRef,
      currentIdState: streamingState.currentMessageId,
      isStreamingFromRef,
      isStreamingFromState: streamingState.isStreaming,
      hasUpdatesInRef,
      hasUpdatesInState: streamingState.updates.length,
      isCurrentMessage,
      result,
      allCurrentUpdates: Object.keys(streamingUpdatesRef.current)
    });
    
    return result;
  }, [streamingState]);

  const getUpdatesForMessage = useCallback((messageId: string) => {
    const currentId = currentMessageIdRef.current;
    
    if (currentId === messageId || streamingState.currentMessageId === messageId) {
      // Prefer ref values as they're more up-to-date
      const updates = updatesRef.current.length > 0 ? updatesRef.current : streamingState.updates;
      console.log('📋 StreamingOverlay: Getting updates for message:', messageId, 'count:', updates.length);
      return updates;
    }
    
    return [];
  }, [streamingState.currentMessageId, streamingState.updates]);

  const getSourcesForMessage = useCallback((messageId: string) => {
    const currentId = currentMessageIdRef.current;
    
    if (currentId === messageId || streamingState.currentMessageId === messageId) {
      const sources = sourcesRef.current.length > 0 ? sourcesRef.current : streamingState.sources;
      console.log('🔗 StreamingOverlay: Getting sources for message:', messageId, 'count:', sources.length);
      return sources;
    }
    
    return [];
  }, [streamingState.currentMessageId, streamingState.sources]);

  const getProgressForMessage = useCallback((messageId: string) => {
    const currentId = currentMessageIdRef.current;
    
    if (currentId === messageId || streamingState.currentMessageId === messageId) {
      const progress = {
        phase: streamingState.currentPhase,
        progress: streamingState.progress
      };
      console.log('📊 StreamingOverlay: Getting progress for message:', messageId, progress);
      return progress;
    }
    
    return { phase: '', progress: 0 };
  }, [streamingState.currentMessageId, streamingState.currentPhase, streamingState.progress]);

  return {
    streamingState,
    startStreaming,
    addStreamingUpdate,
    stopStreaming,
    isStreamingForMessage,
    getUpdatesForMessage,
    getSourcesForMessage,
    getProgressForMessage
  };
};
