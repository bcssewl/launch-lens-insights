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
  
  const {
    addMessage,
    addMessageWithId,
    updateMessage,
    existsMessage,
    getMessage,
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
    
    // Extract message ID from API data - this is required
    const messageId = data.id || data.message_id;
    
    if (!messageId) {
      console.error('❌ Event missing required message ID:', event);
      return;
    }

    console.log('🔄 Processing event for message ID:', messageId, 'Event:', event.event);

    // Get message from store - if it doesn't exist, that's an error
    const existingMessage = getMessage(messageId);
    
    if (!existingMessage) {
      console.error('❌ Message not found in store for ID:', messageId, 'Event:', event.event);
      
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
      updateMessage(messageId, updatedMessage);
    } else {
      // Normal case: merge event with existing message
      const updatedMessage = mergeMessage(existingMessage, event);
      updateMessage(messageId, updatedMessage);
    }

    console.log('✨ Message updated successfully for ID:', messageId);

    // Research session management - FIXED
    if (event.event === 'message_chunk' && data.agent) {
      console.log('🔄 Processing message chunk for agent:', data.agent, 'messageId:', messageId);
      
      switch (data.agent) {
        case 'researcher':
        case 'coder':
          // Get the updated message
          const currentMessage = getMessage(messageId);
          if (currentMessage) {
            console.log('🔬 Processing researcher/coder message:', messageId);
            // Auto-start research session on FIRST researcher/coder (matching original)
            const researchId = autoStartResearchOnFirstActivity(currentMessage);
            
            if (researchId) {
              // Research session just started
              console.log('🔬 Research session auto-started:', researchId);
            } else {
              // Add to existing research session
              const currentResearchId = getCurrentResearchId();
              if (currentResearchId) {
                addResearchActivity(currentResearchId, messageId);
                console.log('🔍 Added activity to existing research:', currentResearchId);
              }
            }
          }
          break;
          
        case 'reporter':
          // Reporter ends the research session AND gets added as an activity
          const reporterMessage = getMessage(messageId);
          if (reporterMessage) {
            console.log('📄 Processing reporter message:', messageId);
            
            // First, try to auto-start research if no session exists
            const researchId = autoStartResearchOnFirstActivity(reporterMessage);
            
            if (researchId) {
              // Research session just started with reporter
              console.log('🔬 Research session auto-started by reporter:', researchId);
              setResearchReport(researchId, messageId);
            } else {
              // Add to existing research session and mark as report
              const currentResearchId = getCurrentResearchId();
              if (currentResearchId) {
                addResearchActivity(currentResearchId, messageId);
                setResearchReport(currentResearchId, messageId);
                console.log('📄 Research completed with report:', messageId);
              }
            }
          }
          break;
          
        case 'planner':
          // Planner messages do NOT start research - they just exist for linking
          console.log('📋 Planner message processed, waiting for researcher to start session');
          break;
      }
    }

    // Handle report generation
    if (event.event === 'report_generated') {
      setReportContent(event.data.content);
      setResearchPanel(true, messageId, 'report');
    }

    setEventCount(prev => prev + 1);
  }, [getMessage, addMessageWithId, updateMessage, setResearchPanel, setReportContent, currentThreadId, startResearch, addResearchActivity, setResearchReport, getCurrentResearchId, autoStartResearchOnFirstActivity]);

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
                console.warn('Failed to parse SSE data:', currentData);
              }
            }
          }
        }
      }

      // Mark all created messages as complete
      for (const messageId of createdMessageIds) {
        const finalMessage = getMessage(messageId);
        if (finalMessage) {
          updateMessage(messageId, {
            ...finalMessage,
            isStreaming: false
          });
        }
      }

      console.log(`✅ DeerFlow streaming completed successfully - processed ${eventCount} events`);

    } catch (error) {
      console.error('❌ DeerFlow streaming failed:', error);
      
      // Reset research state on API failure
      const messageStore = useDeerFlowMessageStore.getState();
      messageStore.resetOngoingResearch();
      
      handleError(error as Error);
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