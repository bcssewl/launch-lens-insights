/**
 * @file useEnhancedDeerStreaming.ts
 * @description Enhanced DeerFlow streaming with proper event handling and store integration
 */

import { useState, useRef, useCallback } from 'react';
import { useDeerFlowStore } from '@/stores/deerFlowStore';
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
  const abortControllerRef = useRef<AbortController | null>(null);
  
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
    settings
  } = useDeerFlowStore();

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

    let currentPartialMessage: Partial<DeerMessage> | null = null;
    let messageId: string | null = null;

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

      let eventCount = 0;
      let lastEventTime = Date.now();
      const STREAM_TIMEOUT = 30000; // 30 seconds

      for await (const { event, data } of fetchStream(url, requestInit)) {
        if (abortControllerRef.current?.signal.aborted) {
          console.log('🛑 Stream aborted by user');
          break;
        }

        try {
          // Update event tracking
          eventCount++;
          lastEventTime = Date.now();

          // Parse the SSE data
          let parsedData: any;
          try {
            parsedData = JSON.parse(data);
          } catch (e) {
            console.warn('⚠️ Failed to parse SSE data:', data);
            continue;
          }

          console.log(`📨 Event ${eventCount}: ${event || 'unknown'}`, parsedData);

          // Check for stream timeout
          if (Date.now() - lastEventTime > STREAM_TIMEOUT) {
            console.warn('⏰ Stream timeout detected - no events for 30 seconds');
            break;
          }

          // Create the stream event object
          const streamEvent: StreamEvent = event ? 
            { event: event as any, data: parsedData } : 
            parsedData; // Legacy format

          // Handle agent-specific logic
          if ('event' in streamEvent && streamEvent.event === 'message_chunk') {
            const agent = streamEvent.data.agent;
            if (agent === 'planner' || agent === 'reporter') {
              setResearchPanelOpen(true);
              if (agent === 'reporter') {
                setActiveResearchTab('report');
              }
            }
          } else if ('agent' in streamEvent && streamEvent.agent) {
            const agent = streamEvent.agent;
            if (agent === 'planner' || agent === 'reporter') {
              setResearchPanelOpen(true);
              if (agent === 'reporter') {
                setActiveResearchTab('report');
              }
            }
          }

          // Handle tool calls - update pending research activities or add new ones
          if ('event' in streamEvent && streamEvent.event === 'tool_calls') {
            // Handle array of tool calls
            const toolCalls = Array.isArray(streamEvent.data) ? streamEvent.data : [streamEvent.data];
            
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

          // Merge the event into the current message
          currentPartialMessage = mergeMessage(currentPartialMessage, streamEvent);

          // Create or update message in store
          if (!messageId) {
            messageId = crypto.randomUUID();
            setCurrentMessageId(messageId);
            
            const initialMessage = finalizeMessage(currentPartialMessage, messageId);
            addMessageWithId({
              ...initialMessage,
              isStreaming: true,
              metadata: {
                ...initialMessage.metadata,
                threadId: currentThreadId
              }
            });
          } else {
            // Update existing message
            if (existsMessage(messageId)) {
              updateMessage(messageId, currentPartialMessage);
            }
          }

          // Handle planner message plan steps -> research activities
          if (currentPartialMessage?.metadata?.agent === 'planner' && 
              currentPartialMessage?.finishReason === 'interrupt' && 
              currentPartialMessage?.metadata?.planSteps) {
            const planSteps = currentPartialMessage.metadata.planSteps;
            
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
          }

        } catch (parseError) {
          console.warn('Failed to process DeerFlow event:', parseError);
        }
      }

      // Finalize the message when streaming ends
      if (messageId && currentPartialMessage) {
        const finalMessage = finalizeMessage(currentPartialMessage, messageId);
        updateMessage(messageId, {
          ...finalMessage,
          isStreaming: false
        });
      }

      console.log(`✅ DeerFlow streaming completed successfully - processed ${eventCount} events`);

    } catch (error) {
      console.error('❌ DeerFlow streaming error:', error);
      
      // Enhanced error handling with recovery
      const isAbortError = error instanceof Error && error.name === 'AbortError';
      const isNetworkError = error instanceof Error && (
        error.message.includes('fetch') || 
        error.message.includes('network') ||
        error.message.includes('connection')
      );
      
      if (messageId) {
        let errorMessage = currentPartialMessage?.content || '';
        
        if (isAbortError) {
          errorMessage += '\n\n⏹️ Stream was stopped by user.';
        } else if (isNetworkError) {
          errorMessage += '\n\n🌐 Network connection issue. Please check your connection and try again.';
        } else {
          errorMessage += `\n\n❌ An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
        
        updateMessage(messageId, {
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
  }, []);

  return {
    startDeerFlowStreaming,
    stopStreaming,
    isStreaming,
    currentMessageId
  };
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