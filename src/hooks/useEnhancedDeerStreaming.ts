/**
 * @file useEnhancedDeerStreaming.ts
 * @description Enhanced DeerFlow streaming with proper event handling and store integration
 */

import { useState, useRef, useCallback, useMemo } from 'react';
import { useDeerFlowStore } from '@/stores/deerFlowStore';
import { useDeerFlowMessageStore } from '@/stores/deerFlowMessageStore';
import { mergeMessage, finalizeMessage, StreamEvent } from '@/utils/mergeMessage';
import { DeerMessage } from '@/stores/deerFlowMessageStore';
import { fetchStream } from '@/utils/fetchStream';

interface DeerStreamingOptions {
  maxPlanIterations?: number;
  maxStepNum?: number;
  maxSearchResults?: number;
  autoAcceptedPlan?: boolean;
  enableBackgroundInvestigation?: boolean;
  reportStyle?: 'academic' | 'casual' | 'detailed';
  enableDeepThinking?: boolean;
}

export const useEnhancedDeerStreaming = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentMessageId, setCurrentMessageId] = useState<string | null>(null);
  const [eventCount, setEventCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentPartialMessageRef = useRef<Partial<DeerMessage> | null>(null);
  const messageIdRef = useRef<string | null>(null);
  
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

  // Immediate event processing for maximum responsiveness
  const processStreamEvent = useCallback((event: StreamEvent) => {
    if (!currentPartialMessageRef.current || !messageIdRef.current) return;

    try {
      // Process event immediately
      currentPartialMessageRef.current = mergeMessage(currentPartialMessageRef.current, event);

      // Update message in store immediately (React 18 batches automatically)
      if (existsMessage(messageIdRef.current)) {
        updateMessage(messageIdRef.current, currentPartialMessageRef.current);
      }

      setEventCount(prev => prev + 1);
    } catch (error) {
      console.warn('Error processing stream event:', error);
    }
  }, [existsMessage, updateMessage]);

  const startDeerFlowStreaming = useCallback(async (
    question: string,
    options: DeerStreamingOptions = {}
  ) => {
    if (isStreaming) {
      console.warn('🦌 DeerFlow is already streaming');
      return;
    }

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();
    
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
      content: question
    });

    // Prepare request using settings from store with options override
    const requestBody = {
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
    };

    try {
      const url = 'https://deer-flow-wrappers.up.railway.app/api/chat/stream';
      const requestInit: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal
      };

      console.log('🔗 Connecting to DeerFlow API:', url);

      let processedEventCount = 0;
      let lastEventTime = Date.now();
      const STREAM_TIMEOUT = 30000; // 30 seconds
      const MAX_EVENTS_PER_BATCH = 50; // Prevent memory overflow

      for await (const { event, data } of fetchStream(url, requestInit)) {
        if (abortControllerRef.current?.signal.aborted) {
          console.log('🛑 Stream aborted by user');
          break;
        }

        try {
          // Update event tracking
          processedEventCount++;
          lastEventTime = Date.now();

          // Prevent memory overflow from too many rapid events
          if (processedEventCount > MAX_EVENTS_PER_BATCH * 10) {
            console.warn('🚨 Too many events, throttling stream');
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          // Parse the SSE data
          let parsedData: any;
          try {
            parsedData = JSON.parse(data);
          } catch (e) {
            console.warn('⚠️ Failed to parse SSE data:', data);
            continue;
          }

          // Only log every 10th event to reduce console spam
          if (processedEventCount % 10 === 0) {
            console.log(`📨 Event ${processedEventCount}: ${event || 'unknown'}`, {
              ...parsedData,
              content: parsedData.content ? `${parsedData.content.substring(0, 50)}...` : undefined
            });
          }

          // Check for stream timeout
          if (Date.now() - lastEventTime > STREAM_TIMEOUT) {
            console.warn('⏰ Stream timeout detected - no events for 30 seconds');
            break;
          }

          // Create the stream event object
          const streamEvent: StreamEvent = event ? 
            { event: event as any, data: parsedData } : 
            parsedData; // Legacy format

          // Simple agent-based panel control for immediate responsiveness
          if ('event' in streamEvent && streamEvent.event === 'message_chunk') {
            const agent = streamEvent.data.agent;
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
                case 'coordinator':
                  // Keep panel state unchanged for coordinator
                  break;
              }
            }
          }

          // Handle report generation with immediate panel updates
          if ('event' in streamEvent && streamEvent.event === 'report_generated') {
            const messageId = messageIdRef.current;
            setReportContent(streamEvent.data.content);
            if (messageId) {
              setResearchPanel(true, messageId, 'report');
            }
          }

          // Create or update message in store
          if (!messageIdRef.current) {
            messageIdRef.current = crypto.randomUUID();
            setCurrentMessageId(messageIdRef.current);
            
            // Initialize the partial message and refs
            currentPartialMessageRef.current = mergeMessage(null, streamEvent);
            
            const initialMessage = finalizeMessage(currentPartialMessageRef.current, messageIdRef.current);
            addMessageWithId({
              ...initialMessage,
              isStreaming: true,
              metadata: {
                ...initialMessage.metadata,
                threadId: currentThreadId
              }
            });
          } else {
            // Process event immediately for maximum responsiveness
            processStreamEvent(streamEvent);
          }


        } catch (parseError) {
          console.warn('Failed to process DeerFlow event:', parseError);
        }
      }

      // Finalize the message when streaming ends
      if (messageIdRef.current && currentPartialMessageRef.current) {
        const finalMessage = finalizeMessage(currentPartialMessageRef.current, messageIdRef.current);
        updateMessage(messageIdRef.current, {
          ...finalMessage,
          isStreaming: false
        });
      }

      console.log(`✅ DeerFlow streaming completed successfully - processed ${processedEventCount} events`);

    } catch (error) {
      console.error('❌ DeerFlow streaming error:', error);
      
      // Enhanced error handling with recovery
      const isAbortError = error instanceof Error && error.name === 'AbortError';
      const isNetworkError = error instanceof Error && (
        error.message.includes('fetch') || 
        error.message.includes('network') ||
        error.message.includes('connection')
      );
      
      if (messageIdRef.current) {
        let errorMessage = currentPartialMessageRef.current?.content || '';
        
        if (isAbortError) {
          errorMessage += '\n\n⏹️ Stream was stopped by user.';
        } else if (isNetworkError) {
          errorMessage += '\n\n🌐 Network connection issue. Please check your connection and try again.';
        } else {
          errorMessage += `\n\n❌ An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
        
        updateMessage(messageIdRef.current, {
          content: errorMessage || 'Sorry, there was an error processing your request.',
          isStreaming: false,
          finishReason: isAbortError ? 'interrupt' : 'error'
        });
      } else if (!isAbortError) {
        // Only add error message if it wasn't user-initiated abort
        addMessage({
          role: 'assistant',
          content: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
          finishReason: 'error'
        });
      }
    } finally {
      setIsStreaming(false);
      setIsResponding(false);
      setCurrentMessageId(null);
      abortControllerRef.current = null;
      
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
    settings
  ]);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      console.log('⏹️ DeerFlow streaming stopped by user');
    }
  }, []);

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
    eventCount
  }), [startDeerFlowStreaming, stopStreaming, cleanup, isStreaming, currentMessageId, eventCount]);
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