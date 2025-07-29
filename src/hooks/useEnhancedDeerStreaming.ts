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
  
  const {
    addMessage,
    updateMessage,
    existsMessage,
    getMessage,
    setIsResponding,
    setResearchPanel,
    setReportContent,
    currentThreadId
  } = useDeerFlowMessageStore();

  const { settings } = useDeerFlowStore();
  const { toast } = useToast();

  // Simple event processing like original
  const processEvent = useCallback((event: StreamEvent) => {
    const data = 'data' in event ? event.data : event;
    const messageId = data.id || data.message_id || currentMessageId;
    
    if (!messageId) return;

    // Get existing message
    const existingMessage = getMessage(messageId);
    if (!existingMessage) return;

    // Update message with new event data
    const updatedMessage = mergeMessage(existingMessage, event);
    updateMessage(messageId, updatedMessage);

    // Handle UI updates based on agent
    if (event.event === 'message_chunk' && data.agent) {
      switch (data.agent) {
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

    // Handle report generation
    if (event.event === 'report_generated') {
      setReportContent(event.data.content);
      setResearchPanel(true, messageId, 'report');
    }

    setEventCount(prev => prev + 1);
  }, [currentMessageId, getMessage, updateMessage, setResearchPanel, setReportContent]);

  // Simple error handling like original
  const handleError = useCallback((error: Error) => {
    console.error('❌ DeerFlow streaming error:', error);
    
    toast({
      title: "Connection Error",
      description: error.message || "Failed to connect to DeerFlow. Please try again.",
      variant: "destructive",
    });

    if (currentMessageId) {
      const existingMessage = getMessage(currentMessageId);
      if (existingMessage) {
        updateMessage(currentMessageId, {
          ...existingMessage,
          content: (existingMessage.content || '') + `\n\n❌ Connection error. Please try again.`,
          isStreaming: false,
          finishReason: 'interrupt'
        });
      }
    }
  }, [currentMessageId, getMessage, updateMessage, toast]);

  const startDeerFlowStreaming = useCallback(async (
    question: string,
    options: DeerStreamingOptions = {}
  ) => {
    if (isStreaming) return;
    
    setIsStreaming(true);
    setIsResponding(true);
    setEventCount(0);
    
    console.log('🦌 Starting DeerFlow streaming for:', question);

    // Add user message (like original)
    addMessage({
      role: 'user',
      content: question,
      threadId: currentThreadId,
      contentChunks: [question]
    });

    // Create assistant message
    const assistantMessageId = crypto.randomUUID();
    setCurrentMessageId(assistantMessageId);
    
    const initialMessage = {
      role: 'assistant' as const,
      content: '',
      threadId: currentThreadId,
      contentChunks: [],
      isStreaming: true
    };
    
    addMessage(initialMessage);
    
    // Get the created message ID
    const messages = useDeerFlowMessageStore.getState().messageIds;
    const createdId = messages[messages.length - 1];
    setCurrentMessageId(createdId);

    // Prepare request body
    const requestBody = JSON.stringify({
      messages: [{ role: "user", content: question }],
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

    // Simple streaming like original - no complex initialization
    try {
      const response = await fetch('https://deer-flow-wrappers.up.railway.app/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body available');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        // Decode chunk and add to buffer
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        
        // Process complete events from buffer
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || ''; // Keep incomplete part in buffer
        
        for (const eventBlock of lines) {
          if (eventBlock.trim()) {
            const lines = eventBlock.split('\n');
            let currentEvent = 'message';
            let currentData: string | null = null;
            
            for (const line of lines) {
              const colonIndex = line.indexOf(': ');
              if (colonIndex === -1) continue;
              
              const key = line.slice(0, colonIndex);
              const value = line.slice(colonIndex + 2);
              
              if (key === 'event') {
                currentEvent = value;
              } else if (key === 'data') {
                currentData = value;
              }
            }
            
            // Process event if we have data
            if (currentData !== null && currentData !== '[DONE]') {
              try {
                const event = {
                  event: currentEvent as any,
                  data: JSON.parse(currentData)
                };
                
                // Process every event the same way (like original)
                processEvent(event);
              } catch (error) {
                console.warn('Failed to parse SSE data:', currentData);
              }
            }
          }
        }
      }

      // Mark message as complete
      if (assistantMessageId) {
        const finalMessage = getMessage(assistantMessageId);
        if (finalMessage) {
          updateMessage(assistantMessageId, {
            ...finalMessage,
            isStreaming: false
          });
        }
      }

      console.log(`✅ DeerFlow streaming completed successfully - processed ${eventCount} events`);

    } catch (error) {
      handleError(error as Error);
    } finally {
      setIsStreaming(false);
      setIsResponding(false);
      setCurrentMessageId(null);
    }
  }, [
    isStreaming,
    addMessage,
    updateMessage,
    getMessage,
    setIsResponding,
    currentThreadId,
    processEvent,
    handleError,
    settings,
    eventCount
  ]);

  const stopStreaming = useCallback(() => {
    console.log('⏹️ DeerFlow streaming stopped by user');
    setIsStreaming(false);
    setIsResponding(false);
  }, []);

  const cleanup = useCallback(() => {
    stopStreaming();
    setEventCount(0);
    setCurrentMessageId(null);
  }, [stopStreaming]);

  return {
    startDeerFlowStreaming,
    stopStreaming,
    cleanup,
    isStreaming,
    currentMessageId,
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