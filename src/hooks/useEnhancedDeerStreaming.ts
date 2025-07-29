/**
 * @file useEnhancedDeerStreaming.ts
 * @description Enhanced DeerFlow streaming with proper event handling and store integration
 */

import { useState, useRef, useCallback, useMemo } from 'react';
import { useDeerFlowStore } from '@/stores/deerFlowStore';
import { useDeerFlowMessageStore } from '@/stores/deerFlowMessageStore';
import { mergeMessage, createCompleteMessage, StreamEvent } from '@/utils/mergeMessage';
import { DeerMessage } from '@/stores/deerFlowMessageStore';
import { useEventStream } from '@/hooks/useEventStream';
import { useToast } from '@/hooks/use-toast';

interface DeerStreamingOptions {
  maxPlanIterations?: number;
  maxStepNum?: number;
  maxSearchResults?: number;
  autoAcceptedPlan?: boolean;
  enableBackgroundInvestigation?: boolean;
  reportStyle?: 'academic' | 'casual' | 'detailed';
  enableDeepThinking?: boolean;
}

interface ConnectionStatus {
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  lastError?: string;
  retryCount: number;
}

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

export const useEnhancedDeerStreaming = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentMessageId, setCurrentMessageId] = useState<string | null>(null);
  const [eventCount, setEventCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'disconnected',
    retryCount: 0
  });
  
  const currentPartialMessageRef = useRef<Partial<DeerMessage> | null>(null);
  const messageIdRef = useRef<string | null>(null);
  const currentRetryRef = useRef<number>(0);
  const currentRequestRef = useRef<string | null>(null);
  
  // Retry configuration
  const retryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 8000
  };
  
  const storeActions = useDeerFlowStore();
  const {
    addMessage,
    updateMessage,
    existsMessage,
    addMessageWithId,
    setIsResponding,
    setResearchPanel,
    setReportContent,
    currentThreadId
  } = useDeerFlowMessageStore();
  
  const { settings } = storeActions;
  const { toast } = useToast();

  // Elegant React streaming with immediate event processing
  const processStreamEvent = useCallback((event: StreamEvent) => {
    if (!currentPartialMessageRef.current || !messageIdRef.current) return;

    try {
      // Direct message update using React state patterns
      currentPartialMessageRef.current = mergeMessage(currentPartialMessageRef.current, event);

      // Update store immediately (React 18 batches automatically)
      if (existsMessage(messageIdRef.current)) {
        updateMessage(messageIdRef.current, currentPartialMessageRef.current);
      }

      // Handle agent-based UI updates with immediate responsiveness
      if ('event' in event && event.event === 'message_chunk') {
        const agent = event.data.agent;
        const messageId = messageIdRef.current;
        
        if (agent && messageId) {
          switch (agent) {
            case 'planner':
            case 'researcher':
            case 'coder':
              setResearchPanel(true, messageId, 'activities');
              break;
            case 'reporter':
              setResearchPanel(true, messageId, 'report');
              break;
          }
        }
      }

      // Handle report generation with immediate panel updates
      if ('event' in event && event.event === 'report_generated') {
        const messageId = messageIdRef.current;
        setReportContent(event.data.content);
        if (messageId) {
          setResearchPanel(true, messageId, 'report');
        }
      }

      setEventCount(prev => prev + 1);
    } catch (error) {
      console.warn('Error processing stream event:', error);
      toast({
        title: "Processing Error",
        description: `Failed to process stream event: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  }, [existsMessage, updateMessage, setResearchPanel, setReportContent, toast]);

  // Enhanced error handling with retry logic
  const handleStreamError = useCallback((error: Error, isRetryable: boolean = true) => {
    const errorMessage = error.message || 'Unknown streaming error';
    
    setConnectionStatus(prev => ({
      ...prev,
      status: 'error',
      lastError: errorMessage
    }));

    // Check if we should retry
    if (isRetryable && currentRetryRef.current < retryConfig.maxRetries) {
      const retryDelay = Math.min(
        retryConfig.baseDelay * Math.pow(2, currentRetryRef.current),
        retryConfig.maxDelay
      );

      toast({
        title: "Connection Issue",
        description: `Retrying in ${retryDelay / 1000}s... (Attempt ${currentRetryRef.current + 1}/${retryConfig.maxRetries})`,
        variant: "destructive",
      });

      setTimeout(() => {
        currentRetryRef.current++;
        if (currentRequestRef.current) {
          // Retry the request
          retryCurrentRequest();
        }
      }, retryDelay);
    } else {
      // Max retries reached or non-retryable error
      toast({
        title: "Connection Failed",
        description: `${errorMessage}. Please check your connection and try again.`,
        variant: "destructive",
      });

      // Reset state
      setIsStreaming(false);
      setIsResponding(false);
      currentRetryRef.current = 0;
    }
  }, [toast, retryConfig]);

  // Retry mechanism
  const retryCurrentRequest = useCallback(async () => {
    if (!currentRequestRef.current) return;

    setConnectionStatus(prev => ({
      ...prev,
      status: 'connecting',
      retryCount: currentRetryRef.current
    }));

    try {
      // Implement retry logic here
      // This would re-execute the streaming request
      console.log(`🔄 Retrying DeerFlow request (attempt ${currentRetryRef.current + 1})`);
    } catch (error) {
      handleStreamError(error as Error);
    }
  }, [handleStreamError]);

  // Create streaming configuration for useEventStream
  const streamUrl = 'https://deer-flow-wrappers.up.railway.app/api/chat/stream';
  const streamOptions = useMemo(() => ({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  }), []);
  
  const { startStream, stopStream, isStreaming: streamActive, error: streamError } = useEventStream(streamUrl, streamOptions);

  const startDeerFlowStreaming = useCallback(async (
    question: string,
    options: DeerStreamingOptions = {}
  ) => {
    if (isStreaming) {
      console.warn('🦌 DeerFlow is already streaming');
      return;
    }

    // Reset retry counter for new request
    currentRetryRef.current = 0;
    setConnectionStatus({
      status: 'connecting',
      retryCount: 0
    });

    setIsStreaming(true);
    setIsResponding(true);
    setEventCount(0);
    
    // Reset refs
    currentPartialMessageRef.current = null;
    messageIdRef.current = null;
    
    console.log('🦌 Starting DeerFlow streaming for:', question);

    // Add user message first
    addMessage({
      role: 'user',
      content: question,
      threadId: currentThreadId,
      contentChunks: []
    });

    // Prepare request body using settings from store with options override
    const requestBody = JSON.stringify({
      messages: [
        { role: "user", content: question }
      ],
      debug: true,
      thread_id: currentThreadId,
      max_plan_iterations: options.maxPlanIterations ?? settings.maxPlanIterations,
      max_step_num: options.maxStepNum ?? settings.maxStepNum,
      max_search_results: options.maxSearchResults ?? settings.maxSearchResults,
      auto_accepted_plan: options.autoAcceptedPlan ?? settings.autoAcceptedPlan,
      enable_background_investigation: options.enableBackgroundInvestigation ?? settings.backgroundInvestigation,
      report_style: options.reportStyle ?? settings.reportStyle,
      enable_deep_thinking: options.enableDeepThinking ?? settings.deepThinking
    });

    // Store current request for retry purposes
    currentRequestRef.current = requestBody;

    try {
      // Set connection status to connected
      setConnectionStatus({
        status: 'connected',
        retryCount: currentRetryRef.current
      });

      // Use the stream hook with dynamic body
      await startStream((event) => {
        // Initialize message on first event
        if (!messageIdRef.current) {
          messageIdRef.current = crypto.randomUUID();
          setCurrentMessageId(messageIdRef.current);
          
          // Initialize the partial message and refs
          currentPartialMessageRef.current = mergeMessage(null, event);
          
          const initialMessage = createCompleteMessage(currentPartialMessageRef.current);
          addMessageWithId({
            ...initialMessage,
            id: messageIdRef.current,
            threadId: currentThreadId,
            isStreaming: true
          });
        } else {
          // Process subsequent events immediately
          processStreamEvent(event);
        }
      }, requestBody); // Pass request body to the stream

      // Finalize message when streaming completes
      if (messageIdRef.current && currentPartialMessageRef.current) {
        const finalMessage = createCompleteMessage(currentPartialMessageRef.current);
        updateMessage(messageIdRef.current, {
          ...finalMessage,
          isStreaming: false
        });
      }

      // Reset retry counter on success
      currentRetryRef.current = 0;
      setConnectionStatus({
        status: 'connected',
        retryCount: 0
      });

      console.log(`✅ DeerFlow streaming completed successfully - processed ${eventCount} events`);

    } catch (error) {
      console.error('❌ DeerFlow streaming error:', error);
      
      // Use enhanced error handling
      handleStreamError(error as Error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown streaming error';
      
      if (messageIdRef.current) {
        const errorContent = currentPartialMessageRef.current?.content || '';
        updateMessage(messageIdRef.current, {
          content: errorContent + `\n\n❌ Connection error. Please try again.`,
          isStreaming: false,
          finishReason: 'interrupt'
        });
      } else {
        // Add error message if no message was created
        addMessage({
          role: 'assistant',
          content: `❌ Connection error: ${errorMessage}. Please try again.`,
          threadId: currentThreadId,
          contentChunks: [],
          finishReason: 'interrupt'
        });
      }
    } finally {
      setIsStreaming(false);
      setIsResponding(false);
      setCurrentMessageId(null);
      
      // Clear refs
      currentPartialMessageRef.current = null;
      messageIdRef.current = null;
    }
  }, [
    isStreaming,
    addMessage,
    updateMessage,
    existsMessage,
    addMessageWithId,
    setIsResponding,
    setResearchPanel,
    setReportContent,
    currentThreadId,
    processStreamEvent,
    settings,
    startStream,
    eventCount,
    handleStreamError
  ]);

  const stopStreaming = useCallback(() => {
    stopStream();
    console.log('⏹️ DeerFlow streaming stopped by user');
  }, [stopStream]);

  // Memory cleanup
  const cleanup = useCallback(() => {
    stopStreaming();
    currentPartialMessageRef.current = null;
    messageIdRef.current = null;
    setEventCount(0);
  }, [stopStreaming]);

  return useMemo(() => ({
    startDeerFlowStreaming,
    stopStreaming,
    cleanup,
    isStreaming,
    currentMessageId,
    eventCount,
    connectionStatus
  }), [startDeerFlowStreaming, stopStreaming, cleanup, isStreaming, currentMessageId, eventCount, connectionStatus]);
};

// Helper function to determine tool type from tool name
function getToolType(toolName: string | undefined): 'web-search' | 'crawl' | 'python' | 'retriever' {
  if (!toolName) {
    return 'web-search'; // Default fallback
  }
  if (toolName.includes('search') || toolName.includes('github')) {
    return 'web-search';
  }
  if (toolName.includes('crawl') || toolName.includes('visit')) {
    return 'crawl';
  }
  if (toolName.includes('python') || toolName.includes('code')) {
    return 'python';
  }
  return 'retriever';
}