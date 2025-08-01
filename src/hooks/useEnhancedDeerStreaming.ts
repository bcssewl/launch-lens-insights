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
  reportStyle?: 'academic' | 'popular_science' | 'news' | 'social_media';
  enableDeepThinking?: boolean;
  interruptFeedback?: string; // ADD interruptFeedback
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
  const [eventCount, setEventCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const {
    addMessage,
    addMessageWithId,
    updateMessage, // DeerFlow-style: updateMessage(message)
    updateMessageById, // Legacy: updateMessageById(id, updates)
    existsMessage,
    getMessage,
    findMessageByToolCallId,
    setIsResponding,
    setResearchPanel,
    setReportContent,
    currentThreadId,
    // Research session management
    startResearch,
    addResearchActivity,
    setResearchReport,
    getCurrentResearchId,
    autoStartResearchOnFirstActivity
  } = useDeerFlowMessageStore();

  const { settings } = useDeerFlowStore();
  const { toast } = useToast();

  // Helper function to generate MCP settings from configured servers
  const generateMCPSettings = useCallback(() => {
    const mcpSettings: Record<string, any> = {};
    
    settings.mcpServers
      .filter(server => server.enabled)
      .forEach(server => {
        mcpSettings[server.name] = {
          url: server.url,
          enabled: true,
          ...server.metadata
        };
      });
    
    return mcpSettings;
  }, [settings.mcpServers]);

  // Simplified and robust event processing
  const processEvent = useCallback((event: StreamEvent) => {
    // Defensive: ensure event has proper structure
    if (!event || !('data' in event) || !event.data) {
      console.error('❌ Invalid event structure:', event);
      return;
    }

    const data = event.data;
    
    // Special handling for tool_call_result events like DeerFlow
    const eventType = (event as any).event || (event as any).type;
    if (eventType === 'tool_call_result') {
      const eventData = event.data || event;
      console.log('🔧 Processing tool_call_result for tool_call_id:', eventData.tool_call_id);
      
      // Find message by tool call ID (like DeerFlow does)
      const targetMessage = findMessageByToolCallId(eventData.tool_call_id);
      if (targetMessage) {
        console.log('🔧 Found message with tool call:', targetMessage.id);
        const updatedMessage = mergeMessage(targetMessage, event);
        updateMessage(updatedMessage); // DeerFlow-style call
        console.log('✨ Tool call result updated for message:', targetMessage.id);
      } else {
        console.error('❌ No message found with tool_call_id:', eventData.tool_call_id);
      }
      return;
    }
    
    // Extract message ID from API data - this is required for other events
    const messageId = data.id || data.message_id;
    
    if (!messageId) {
      console.error('❌ Event missing required message ID:', event);
      return;
    }

    // Debug logging - reduced to prevent console spam
    if (process.env.NODE_ENV === 'development') {
      // Only log important events, not every chunk
      if (eventType !== 'message_chunk') {
        console.log('🔄 Processing event for message ID:', messageId, 'Event:', eventType);
      }
    }

    // Get message from store - if it doesn't exist, that's an error
    const existingMessage = getMessage(messageId);
    
    if (!existingMessage) {
      console.error('❌ Message not found in store for ID:', messageId, 'Event:', eventType);
      
      // Create message on-demand for robustness
      const newMessage = {
        id: messageId,
        role: 'assistant' as const,
        content: '',
        threadId: currentThreadId,
        contentChunks: [],
        reasoningContent: '',
        reasoningContentChunks: [],
        timestamp: new Date(),
        isStreaming: true,
        agent: data.agent
      };
      
      console.log('🆘 Creating missing message on-demand:', messageId);
      addMessageWithId(newMessage);
      
      // Get the newly created message
      const createdMessage = getMessage(messageId);
      if (!createdMessage) {
        console.error('❌ Failed to create message on-demand');
        return;
      }
      
      // Continue with the newly created message
      const updatedMessage = mergeMessage(createdMessage, event);
      updateMessage(updatedMessage); // DeerFlow-style call
    } else {
      // Normal case: merge event with existing message
      const updatedMessage = mergeMessage(existingMessage, event);
      updateMessage(updatedMessage); // DeerFlow-style call
    }

    console.log('✨ Message updated successfully for ID:', messageId);

    // Handle reporter completion when streaming finishes (matching DeerFlow)
    if (event.data.finish_reason && data.agent === 'reporter') {
      const currentResearchId = getCurrentResearchId();
      if (currentResearchId) {
        setResearchReport(currentResearchId, messageId);
        console.log('📄 Research completed with report:', messageId);
      }
    }

    // Handle report generation
    if (eventType === 'report_generated') {
      setReportContent(event.data.content);
      setResearchPanel(true, messageId, 'report');
    }

    setEventCount(prev => prev + 1);
  }, [getMessage, findMessageByToolCallId, addMessageWithId, updateMessage, setResearchPanel, setReportContent, currentThreadId, startResearch, addResearchActivity, setResearchReport, getCurrentResearchId, autoStartResearchOnFirstActivity]);

  // Simplified error handling without currentMessageId fallback
  const handleError = useCallback((error: Error) => {
    console.error('❌ DeerFlow streaming error:', error);
    
    // Reset research state on error to allow retry
    const messageStore = useDeerFlowMessageStore.getState();
    messageStore.resetOngoingResearch();
    
    toast({
      title: "Connection Error",
      description: error.message || "Failed to connect to DeerFlow API. You can try starting the research again.",
      variant: "destructive",
    });
  }, [toast]);

  const startDeerFlowStreaming = useCallback(async (
    question: string,
    options: DeerStreamingOptions = {}
  ) => {
    if (isStreaming) return;
    
    setIsStreaming(true);
    setIsResponding(true);
    setEventCount(0);
    
    console.log('🦌 Starting DeerFlow streaming for:', question);
    console.log('🔍 Debug - question:', question);
    console.log('🔍 Debug - options:', options);
    console.log('🔍 Debug - options.interruptFeedback:', options.interruptFeedback);

    // For interrupt feedback (plan acceptance/editing), don't create a user message
    const isInterruptFeedback = !!options.interruptFeedback;
    console.log('🔍 Debug - isInterruptFeedback:', isInterruptFeedback);
    
    if (!isInterruptFeedback) {
      // Add user message only for new questions
      addMessage({
        role: 'user',
        content: question,
        threadId: currentThreadId,
        contentChunks: [question]
      });
      console.log('👤 Added user message for new question');
    } else {
      console.log('🔄 Interrupt feedback detected, skipping user message creation');
    }

    // Track created message IDs to mark as complete later
    const createdMessageIds = new Set<string>();

    // Generate MCP settings dynamically
    const mcpSettings = generateMCPSettings();
    
    // Prepare request body with dynamic settings
    const requestBody = JSON.stringify({
      messages: isInterruptFeedback ? [] : [{ role: "user", content: question }],
      debug: true,
      thread_id: currentThreadId,
      interrupt_feedback: options.interruptFeedback,
      auto_accepted_plan: options.autoAcceptedPlan ?? settings.autoAcceptedPlan,
      max_plan_iterations: options.maxPlanIterations ?? settings.maxPlanIterations,
      max_step_num: options.maxStepNum ?? settings.maxStepNum,
      max_search_results: options.maxSearchResults ?? settings.maxSearchResults,
      enable_deep_thinking: options.enableDeepThinking ?? settings.deepThinking,
      enable_background_investigation: options.enableBackgroundInvestigation ?? settings.backgroundInvestigation,
      report_style: options.reportStyle ?? settings.reportStyle,
      locale: 'en-US', // Force English locale to match DeerFlow
      mcp_settings: mcpSettings
    });

    console.log('🔍 Debug - Final request body:', requestBody);

    console.log('📤 Sending to backend with dynamic settings:', {
      thread_id: currentThreadId,
      interrupt_feedback: options.interruptFeedback,
      content: question,
      settings: {
        auto_accepted_plan: options.autoAcceptedPlan ?? settings.autoAcceptedPlan,
        max_plan_iterations: options.maxPlanIterations ?? settings.maxPlanIterations,
        max_step_num: options.maxStepNum ?? settings.maxStepNum,
        max_search_results: options.maxSearchResults ?? settings.maxSearchResults,
        enable_deep_thinking: options.enableDeepThinking ?? settings.deepThinking,
        enable_background_investigation: options.enableBackgroundInvestigation ?? settings.backgroundInvestigation,
        report_style: options.reportStyle ?? settings.reportStyle,
        mcp_settings: mcpSettings
      }
    });

    // Simple streaming like original - no complex initialization
    // Create abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    try {
      // Use the fetchStream utility instead of manual parsing
      const { fetchStream } = await import('@/utils/fetchStream');
      
      for await (const sseEvent of fetchStream('https://deerflowfinal-wrappers.up.railway.app/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
        signal: abortController.signal
      })) {
        // Process event if we have data
        if (sseEvent.data !== '[DONE]') {
          try {
            const event = {
              event: sseEvent.event as any,
              data: JSON.parse(sseEvent.data)
            };
            
            // Extract API message ID from event
            const apiMessageId = event.data.id || event.data.message_id;
            
            // Create message for each unique API message ID (one per agent)
            if (apiMessageId && !createdMessageIds.has(apiMessageId)) {
              console.log('📝 Creating message with API ID:', apiMessageId, 'Agent:', event.data.agent);
              
              const initialMessage = {
                id: apiMessageId,
                role: 'assistant' as const,
                content: '',
                threadId: currentThreadId,
                contentChunks: [],
                reasoningContent: '',
                reasoningContentChunks: [],
                timestamp: new Date(),
                isStreaming: true,
                agent: event.data.agent
              };
              
              addMessageWithId(initialMessage);
              createdMessageIds.add(apiMessageId);
            }
            
            // Process event with consistent API ID
            processEvent(event);
          } catch (error) {
            console.warn('Failed to parse SSE data for event:', sseEvent.event, 'Data:', sseEvent.data, 'Error:', error);
            // Continue processing other events rather than creating error messages
          }
        }
      }

      // Mark all created messages as complete
      for (const messageId of createdMessageIds) {
        const finalMessage = getMessage(messageId);
        if (finalMessage) {
          updateMessage({
            ...finalMessage,
            isStreaming: false
          }); // DeerFlow-style call
        }
      }

      console.log(`✅ DeerFlow streaming completed successfully - processed ${eventCount} events`);

    } catch (error) {
      // Handle abort errors gracefully
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('⏹️ DeerFlow streaming was cancelled by user');
        return;
      }
      
      console.error('❌ DeerFlow streaming failed:', error);
      
      // Reset research state on API failure
      const messageStore = useDeerFlowMessageStore.getState();
      messageStore.resetOngoingResearch();
      
      // Provide user-friendly error messages
      if (error instanceof Error) {
        if (error.message.includes('Network connection lost')) {
          handleError(new Error('Connection lost during research. Please check your internet connection and try again.'));
        } else if (error.message.includes('Failed to connect')) {
          handleError(new Error('Unable to connect to research server. Please try again in a few moments.'));
        } else {
          handleError(error);
        }
      } else {
        handleError(new Error('An unexpected error occurred during research. Please try again.'));
      }
    } finally {
      setIsStreaming(false);
      setIsResponding(false);
    }
  }, [
    isStreaming,
    addMessage,
    addMessageWithId,
    updateMessage,
    getMessage,
    setIsResponding,
    currentThreadId,
    processEvent,
    handleError,
    settings,
    eventCount,
    generateMCPSettings
  ]);

  const stopStreaming = useCallback(() => {
    console.log('⏹️ DeerFlow streaming stopped by user');
    
    // Abort the current request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setIsStreaming(false);
    setIsResponding(false);
  }, []);

  const cleanup = useCallback(() => {
    stopStreaming();
    setEventCount(0);
  }, [stopStreaming]);

  return {
    startDeerFlowStreaming,
    stopStreaming,
    cleanup,
    isStreaming,
    eventCount,
    connectionStatus: {
      status: isStreaming ? 'connected' : 'disconnected',
      retryCount: 0
    }
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