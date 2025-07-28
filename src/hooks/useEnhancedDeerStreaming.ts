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
import { useDebounceEvents } from '@/hooks/useDebounceEvents';

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
    setResearchPanelOpen,
    setActiveResearchTab,
    addResearchActivity,
    updateResearchActivity,
    setReportContent,
    currentThreadId,
    researchActivities,
    setThreadContext,
    getThreadContext
  } = useDeerFlowMessageStore();
  
  const { settings } = storeActions;

  // Debounced event processing to prevent UI overload
  const processEventBatch = useCallback((events: StreamEvent[]) => {
    if (!currentPartialMessageRef.current || !messageIdRef.current) return;

    try {
      // Process events in batch
      for (const event of events) {
        currentPartialMessageRef.current = mergeMessage(currentPartialMessageRef.current, event);
      }

      // Update message in store (throttled)
      if (existsMessage(messageIdRef.current)) {
        updateMessage(messageIdRef.current, currentPartialMessageRef.current);
      }

      setEventCount(prev => prev + events.length);
    } catch (error) {
      console.warn('Error processing event batch:', error);
    }
  }, [existsMessage, updateMessage]);

  const { processEvent, flush, cancel } = useDebounceEvents(processEventBatch, {
    baseDelay: 250,
    maxDelay: 1000,
    throttleThreshold: 100,
    maxBatchSize: 25
  });

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

          // Advanced throttling with progressive delays
          if (processedEventCount > 100) { // Much lower threshold
            const throttleDelay = Math.min(200 + (processedEventCount - 100) * 50, 2000);
            console.warn(`🔥 High event volume (${processedEventCount}), applying ${throttleDelay}ms throttle`);
            await new Promise(resolve => setTimeout(resolve, throttleDelay));
            
            // Reset counter but with memory of recent throttling
            processedEventCount = Math.max(0, processedEventCount - 50);
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

          // Handle agent-specific logic and UI management
          if ('event' in streamEvent && streamEvent.event === 'message_chunk') {
            const agent = streamEvent.data.agent;
            const content = streamEvent.data.content || '';
            console.log(`🤖 Message chunk from agent: ${agent}, content: "${content.substring(0, 50)}..."`);
            
            // Context-aware panel management
            if (agent === 'planner') {
              setResearchPanelOpen(true);
            } else if (agent === 'reporter') {
              // Check if this is a direct answer based on thread context
              const threadContext = getThreadContext(currentThreadId);
              if (!threadContext.expectingReporterDirectAnswer) {
                // Only open research panel if this is not a direct answer
                setResearchPanelOpen(true);
                setActiveResearchTab('report');
              } else {
                console.log('🔄 Reporter providing direct answer - not opening research panel');
              }
            } else if (agent === 'coordinator' || agent === 'assistant') {
              // Close research panel for final answers
              console.log(`📝 Final answer from ${agent}`);
            }
          } else if ('agent' in streamEvent && streamEvent.agent) {
            const agent = streamEvent.agent;
            const content = streamEvent.content || '';
            console.log(`🤖 Legacy format - agent: ${agent}, content: "${content.substring(0, 50)}..."`);
            
            // Context-aware panel management for legacy format
            if (agent === 'planner') {
              setResearchPanelOpen(true);
            } else if (agent === 'reporter') {
              // Check if this is a direct answer based on thread context
              const threadContext = getThreadContext(currentThreadId);
              if (!threadContext.expectingReporterDirectAnswer) {
                setResearchPanelOpen(true);
                setActiveResearchTab('report');
              }
            }
          }

          // Handle tool_calls event specifically
          if ('event' in streamEvent && streamEvent.event === 'tool_calls') {
            console.log('🔧 Processing tool_calls (plural) event:', streamEvent.data);
            // This will be handled by mergeMessage function now
          }

          // Handle legacy tool calls - update pending research activities or add new ones
          if ('tool_calls' in streamEvent && streamEvent.tool_calls) {
            // Handle array of tool calls
            const toolCalls = Array.isArray(streamEvent.tool_calls) ? streamEvent.tool_calls : [streamEvent.tool_calls];
            
            for (const toolCall of toolCalls) {
              // Try to find a pending research activity that matches this tool call
              const pendingActivity = researchActivities
                .filter(activity => activity.threadId === currentThreadId && activity.status === 'pending')
                .shift(); // Get the first pending activity
              
              if (pendingActivity) {
                // Update the first pending activity to running
                updateResearchActivity(pendingActivity.id, {
                  ...pendingActivity,
                  title: `${toolCall.name}: ${pendingActivity.title}`,
                  content: toolCall.args,
                  status: 'running'
                });
              } else {
                // Add new research activity if no pending ones found
                addResearchActivity({
                  toolType: getToolType(toolCall.name),
                  title: `Using tool: ${toolCall.name}`,
                  content: toolCall.args,
                  status: 'running'
                });
              }
            }
          }

          // Handle tool call chunks - update pending research activities or add new ones
          if ('event' in streamEvent && streamEvent.event === 'tool_call_chunks') {
            // Handle array of tool call chunks
            const toolCallChunks = Array.isArray(streamEvent.data) ? streamEvent.data : [streamEvent.data];
            
            for (const chunk of toolCallChunks) {
              if (chunk.name) {
                // Try to find a pending research activity that matches this tool call
                const pendingActivity = researchActivities
                  .filter(activity => activity.threadId === currentThreadId && activity.status === 'pending')
                  .shift(); // Get the first pending activity
                
                if (pendingActivity) {
                  // Update the first pending activity to running
                  updateResearchActivity(pendingActivity.id, {
                    ...pendingActivity,
                    title: `${chunk.name}: ${pendingActivity.title}`,
                    content: chunk.args || {},
                    status: 'running'
                  });
                } else {
                  // Add new research activity if no pending ones found
                  addResearchActivity({
                    toolType: getToolType(chunk.name),
                    title: `Using tool: ${chunk.name}`,
                    content: chunk.args || {},
                    status: 'running'
                  });
                }
              }
            }
          }

          // Handle tool results - update research activities to completed
          if ('event' in streamEvent && streamEvent.event === 'tool_call_result') {
            const result = streamEvent.data.result;
            
            // Find the most recent running activity for this thread
            const runningActivity = researchActivities
              .filter(activity => activity.threadId === currentThreadId && activity.status === 'running')
              .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
              .shift(); // Get the most recent running activity
            
            if (runningActivity) {
              // Update the running activity with results
              updateResearchActivity(runningActivity.id, {
                ...runningActivity,
                content: result,
                status: 'completed'
              });
            } else {
              // Fallback: create new activities for specific result types
              if (result?.repositories) {
                addResearchActivity({
                  toolType: 'web-search',
                  title: 'GitHub Trending Repositories',
                  content: result.repositories,
                  status: 'completed'
                });
              }

              if (result?.results) {
                addResearchActivity({
                  toolType: 'web-search', 
                  title: 'Search Results',
                  content: result.results,
                  status: 'completed'
                });
              }
            }
          }

          // Handle report generation
          if ('event' in streamEvent && streamEvent.event === 'report_generated') {
            console.log('📄 Report generated!', streamEvent.data);
            setReportContent(streamEvent.data.content);
            setActiveResearchTab('report');
            setResearchPanelOpen(true);
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
            // Process event through debounced handler for performance
            processEvent(streamEvent);
          }

          // Handle planner message plan steps -> research activities + context tracking
          if (currentPartialMessageRef.current?.metadata?.agent === 'planner' && 
              currentPartialMessageRef.current?.finishReason === 'interrupt' && 
              currentPartialMessageRef.current?.metadata?.planSteps) {
            const planSteps = currentPartialMessageRef.current.metadata.planSteps;
            const hasEnoughContext = currentPartialMessageRef.current.metadata.hasEnoughContext || false;
            const isPlannerDirectAnswer = currentPartialMessageRef.current.metadata.isPlannerDirectAnswer || false;
            
            console.log('🎯 Planner finished with', planSteps.length, 'steps, hasEnoughContext:', hasEnoughContext);
            
            // Set thread context based on planner decision
            setThreadContext(currentThreadId, {
              plannerIndicatedDirectAnswer: isPlannerDirectAnswer,
              expectingReporterDirectAnswer: isPlannerDirectAnswer
            });
            
            if (planSteps.length > 0) {
              // Add each plan step as a pending research activity
              planSteps.forEach((step: any, index: number) => {
                const stepTitle = typeof step === 'string' ? step : (step.title || step.description || `Step ${index + 1}`);
                const stepDescription = typeof step === 'string' ? '' : (step.description || '');
                
                addResearchActivity({
                  toolType: 'web-search', // Default type for plan steps
                  title: stepTitle,
                  content: stepDescription,
                  status: 'pending'
                });
              });

              setResearchPanelOpen(true);
              setActiveResearchTab('activities');
            } else if (isPlannerDirectAnswer) {
              // For direct answers, don't open research panel
              console.log('🔄 Expecting reporter direct answer, not opening research panel');
            }
          }

          // Reset thread context when reporter finishes providing direct answer
          if (currentPartialMessageRef.current?.metadata?.agent === 'reporter' && 
              currentPartialMessageRef.current?.finishReason === 'interrupt') {
            const threadContext = getThreadContext(currentThreadId);
            if (threadContext.expectingReporterDirectAnswer) {
              console.log('✅ Reporter direct answer completed, resetting thread context');
              setThreadContext(currentThreadId, {
                plannerIndicatedDirectAnswer: false,
                expectingReporterDirectAnswer: false
              });
            }
          }

        } catch (parseError) {
          console.warn('Failed to process DeerFlow event:', parseError);
        }
      }

      // Flush any remaining debounced events
      flush();

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
      // Cancel any pending debounced events
      cancel();
      
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
    setResearchPanelOpen,
    setActiveResearchTab,
    addResearchActivity,
    updateResearchActivity,
    setReportContent,
    currentThreadId,
    researchActivities
  ]);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      console.log('⏹️ DeerFlow streaming stopped by user');
    }
    
    // Cancel pending events and flush immediately
    cancel();
    flush();
  }, [cancel, flush]);

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