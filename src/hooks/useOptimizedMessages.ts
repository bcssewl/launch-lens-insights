/**
 * @file useOptimizedMessages.ts
 * @description Optimized React hooks for efficient message rendering with Map-based storage
 */

import { useCallback, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useDeerFlowMessageStore } from '@/stores/deerFlowMessageStore';
import type { DeerMessage } from '@/stores/deerFlowMessageStore';

/**
 * Message IDs hook following original DeerFlow pattern
 * Returns array of message IDs for efficient individual subscriptions
 */
export const useMessageIds = (threadId?: string) => {
  return useDeerFlowMessageStore(
    useShallow((state) => {
      const targetThreadId = threadId || state.currentThreadId;
      return state.threadMessageIds.get(targetThreadId) || [];
    })
  );
};

/**
 * LEGACY: Kept for backward compatibility - use useMessageIds instead
 * Only use for non-reactive cases or when you need the full message objects
 */
export const useMessageList = (threadId?: string) => {
  // Remove over-aggressive memoization during debugging
  return useDeerFlowMessageStore((state) => {
    const targetThreadId = threadId || state.currentThreadId;
    const messages = state.getMessagesByThread(targetThreadId);
    console.log('🔄 useMessageList re-render', messages.length, 'messages');
    return messages;
  });
};

/**
 * Individual message hook for optimized re-renders - PREFERRED PATTERN
 * Only re-renders when the specific message changes
 */
export const useMessage = (messageId: string) => {
  return useDeerFlowMessageStore(
    useShallow((state) => {
      return state.getMessage(messageId);
    })
  );
};

/**
 * Streaming message hook for real-time updates
 * Provides efficient update functions for streaming content
 */
export const useStreamingMessage = (messageId: string) => {
  const { updateMessage, setIsResponding } = useDeerFlowMessageStore();
  
  const updateStreamingMessage = useCallback((updates: Partial<DeerMessage>) => {
    // React 18 batches these updates automatically
    updateMessage(messageId, updates);
    
    // Update streaming status
    if (updates.content) {
      setIsResponding(true);
    }
  }, [messageId, updateMessage, setIsResponding]);
  
  const finalizeMessage = useCallback((finalUpdates: Partial<DeerMessage>) => {
    updateMessage(messageId, {
      ...finalUpdates,
      isStreaming: false,
      finishReason: 'stop'
    });
    setIsResponding(false);
  }, [messageId, updateMessage, setIsResponding]);
  
  return {
    updateStreamingMessage,
    finalizeMessage
  };
};

/**
 * Research panel hook with message integration
 * Efficiently manages research panel state and message references
 */
export const useResearchPanel = () => {
  const { 
    researchPanelState, 
    getMessage, 
    setResearchPanel 
  } = useDeerFlowMessageStore();
  
  const researchMessage = useMemo(() => {
    return researchPanelState.openResearchId 
      ? getMessage(researchPanelState.openResearchId)
      : null;
  }, [researchPanelState.openResearchId, getMessage]);
  
  const openResearchPanel = useCallback((messageId: string, tab: 'activities' | 'report' = 'activities') => {
    setResearchPanel(true, messageId, tab);
  }, [setResearchPanel]);
  
  const closeResearchPanel = useCallback(() => {
    setResearchPanel(false);
  }, [setResearchPanel]);
  
  const switchTab = useCallback((tab: 'activities' | 'report') => {
    setResearchPanel(researchPanelState.isOpen, researchPanelState.openResearchId, tab);
  }, [setResearchPanel, researchPanelState.isOpen, researchPanelState.openResearchId]);
  
  return {
    ...researchPanelState,
    researchMessage,
    openResearchPanel,
    closeResearchPanel,
    switchTab
  };
};

/**
 * Message stats hook for performance monitoring
 * Provides efficient access to message counts and statistics
 */
export const useMessageStats = () => {
  return useDeerFlowMessageStore(useCallback((state) => {
    return {
      totalMessages: state.messageIds.length,
      currentThreadMessageCount: state.threadMessageIds.get(state.currentThreadId)?.length || 0,
      threadCount: state.threadMessageIds.size,
      isStreaming: state.isResponding,
      streamingMessageId: state.streamingMessageId,
      hasError: !!state.error.message
    };
  }, []));
};

/**
 * Thread management hook with efficient operations
 * Handles thread creation, switching, and cleanup
 */
export const useThreadManager = () => {
  const { 
    currentThreadId, 
    createNewThread, 
    setCurrentThread, 
    clearMessages,
    getMessagesByThread
  } = useDeerFlowMessageStore();
  
  const switchThread = useCallback((threadId: string) => {
    setCurrentThread(threadId);
  }, [setCurrentThread]);
  
  const createThread = useCallback(() => {
    return createNewThread();
  }, [createNewThread]);
  
  const getThreadMessages = useCallback((threadId: string) => {
    return getMessagesByThread(threadId);
  }, [getMessagesByThread]);
  
  const clearCurrentThread = useCallback(() => {
    clearMessages();
  }, [clearMessages]);
  
  return {
    currentThreadId,
    switchThread,
    createThread,
    getThreadMessages,
    clearCurrentThread
  };
};

/**
 * Error state hook for streamlined error handling
 * Provides access to error state and recovery functions
 */
export const useErrorState = () => {
  const error = useDeerFlowMessageStore(state => state.error);
  
  const clearError = useCallback(() => {
    useDeerFlowMessageStore.setState({
      error: {
        message: null,
        type: null,
        recoverable: false
      }
    });
  }, []);
  
  const setError = useCallback((message: string, type: 'network' | 'stream' | 'validation', recoverable = true) => {
    useDeerFlowMessageStore.setState({
      error: {
        message,
        type,
        recoverable
      }
    });
  }, []);
  
  return {
    error,
    hasError: !!error.message,
    clearError,
    setError
  };
};