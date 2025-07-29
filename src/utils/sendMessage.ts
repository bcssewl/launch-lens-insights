/**
 * @file sendMessage.ts
 * @description Exact DeerFlow sendMessage implementation for message chain management
 */

import { nanoid } from 'nanoid';
import { useDeerFlowMessageStore } from '@/stores/deerFlowMessageStore';
import { mergeMessage } from './mergeMessage';
import { toast } from '@/hooks/use-toast';

interface Resource {
  id: string;
  type: string;
  content: string;
}

interface ChatSettings {
  autoAcceptedPlan: boolean;
  enableDeepThinking: boolean;
  enableBackgroundInvestigation: boolean;
  maxPlanIterations: number;
  maxStepNum: number;
  maxSearchResults: number;
  reportStyle: string;
  mcpSettings: any;
}

interface SendMessageOptions {
  interruptFeedback?: string;
  resources?: Array<Resource>;
}

interface StreamOptions {
  abortSignal?: AbortSignal;
}

// Mock chat settings - replace with real settings implementation
const getChatStreamSettings = (): ChatSettings => ({
  autoAcceptedPlan: false,
  enableDeepThinking: false,
  enableBackgroundInvestigation: true,
  maxPlanIterations: 3,
  maxStepNum: 10,
  maxSearchResults: 10,
  reportStyle: 'comprehensive',
  mcpSettings: {}
});

// Mock stream generator - replace with real API call
async function* chatStream(
  content: string,
  params: any,
  options: StreamOptions = {}
): AsyncGenerator<any> {
  // This is a mock implementation - replace with real streaming API
  console.log('🌊 Mock chatStream called with:', { content, params });
  
  // Simulate different message types for testing
  const messageId = nanoid();
  const threadId = params.thread_id;
  
  // Simulate planner response for testing
  if (content.toLowerCase().includes('research') || content.toLowerCase().includes('analyze')) {
    yield {
      type: 'message_start',
      data: {
        id: messageId,
        thread_id: threadId,
        role: 'assistant',
        agent: 'planner',
        content: ''
      }
    };
    
    const planContent = JSON.stringify({
      title: 'Research Analysis Plan',
      thought: 'I need to create a comprehensive research plan for this topic.',
      steps: [
        {
          title: 'Initial Research',
          description: 'Gather basic information about the topic',
          step_type: 'research',
          need_web_search: true
        },
        {
          title: 'Analysis',
          description: 'Analyze the gathered information',
          step_type: 'processing',
          need_web_search: false
        }
      ]
    });
    
    // Simulate streaming content
    for (let i = 0; i < planContent.length; i += 10) {
      const chunk = planContent.slice(i, i + 10);
      yield {
        type: 'message_chunk',
        data: {
          id: messageId,
          thread_id: threadId,
          content: chunk
        }
      };
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    yield {
      type: 'message_end',
      data: {
        id: messageId,
        thread_id: threadId,
        isStreaming: false,
        options: [
          { text: 'Accept Plan', value: 'accepted' },
          { text: 'Modify Plan', value: 'modify' },
          { text: 'Reject Plan', value: 'reject' }
        ]
      }
    };
  }
  
  // If interrupt feedback is "accepted", start research agents
  if (params.interrupt_feedback === 'accepted') {
    // Simulate researcher agent
    const researcherId = nanoid();
    yield {
      type: 'message_start',
      data: {
        id: researcherId,
        thread_id: threadId,
        role: 'assistant',
        agent: 'researcher',
        content: ''
      }
    };
    
    const researchContent = 'Starting comprehensive research on the topic...';
    for (const char of researchContent) {
      yield {
        type: 'message_chunk',
        data: {
          id: researcherId,
          thread_id: threadId,
          content: char
        }
      };
      await new Promise(resolve => setTimeout(resolve, 30));
    }
    
    yield {
      type: 'message_end',
      data: {
        id: researcherId,
        thread_id: threadId,
        isStreaming: false
      }
    };
    
    // Simulate reporter agent
    const reporterId = nanoid();
    yield {
      type: 'message_start',
      data: {
        id: reporterId,
        thread_id: threadId,
        role: 'assistant',
        agent: 'reporter',
        content: ''
      }
    };
    
    const reportContent = '# Research Report\n\nBased on the research conducted, here are the key findings...\n\n## Summary\n\nThe analysis reveals important insights about the topic.';
    for (let i = 0; i < reportContent.length; i += 5) {
      const chunk = reportContent.slice(i, i + 5);
      yield {
        type: 'message_chunk',
        data: {
          id: reporterId,
          thread_id: threadId,
          content: chunk
        }
      };
      await new Promise(resolve => setTimeout(resolve, 40));
    }
    
    yield {
      type: 'message_end',
      data: {
        id: reporterId,
        thread_id: threadId,
        isStreaming: false
      }
    };
  }
}

/**
 * EXACT DeerFlow sendMessage function behavior (Lines 100-200 in original store.ts)
 */
export async function sendMessage(
  content?: string,
  {
    interruptFeedback,
    resources,
  }: SendMessageOptions = {},
  options: StreamOptions = {},
) {
  const { 
    currentThreadId, 
    appendMessage, 
    setIsResponding, 
    updateMessage, 
    getMessage,
    existsMessage,
    findMessageByToolCallId 
  } = useDeerFlowMessageStore.getState();
  
  console.log('📨 sendMessage called:', { content, interruptFeedback, resources });
  
  // STEP 1: Create user message (only if content provided)
  if (content != null) {
    appendMessage({
      id: nanoid(),
      threadId: currentThreadId,
      role: "user",
      content: content,
      contentChunks: [content],
      timestamp: new Date(),
    });
  }

  // STEP 2: Get settings and start streaming
  const settings = getChatStreamSettings();
  const stream = chatStream(
    content ?? "[REPLAY]",
    {
      thread_id: currentThreadId,
      interrupt_feedback: interruptFeedback,
      resources,
      auto_accepted_plan: settings.autoAcceptedPlan,
      enable_deep_thinking: settings.enableDeepThinking,
      enable_background_investigation: settings.enableBackgroundInvestigation,
      max_plan_iterations: settings.maxPlanIterations,
      max_step_num: settings.maxStepNum,
      max_search_results: settings.maxSearchResults,
      report_style: settings.reportStyle,
      mcp_settings: settings.mcpSettings,
    },
    options,
  );

  setIsResponding(true);
  let messageId: string | undefined;
  
  try {
    for await (const event of stream) {
      const { type, data } = event;
      messageId = data.id;
      let message: any | undefined;
      
      console.log('🌊 Stream event:', type, data);
      
      // STEP 3: Handle tool call results (find existing message)
      if (type === "tool_call_result") {
        message = findMessageByToolCallId(data.tool_call_id);
      } else if (!existsMessage(messageId)) {
        // STEP 4: Create new assistant message
        message = {
          id: messageId,
          threadId: data.thread_id,
          agent: data.agent,
          role: data.role || 'assistant',
          content: "",
          contentChunks: [],
          reasoningContent: "",
          reasoningContentChunks: [],
          isStreaming: true,
          interruptFeedback,
          timestamp: new Date(),
          ...(data.options && { options: data.options })
        };
        appendMessage(message);
      }
      
      // STEP 5: Merge streaming event into message
      message ??= getMessage(messageId);
      if (message) {
        const mergedMessage = mergeMessage(message, event);
        updateMessage(message.id, mergedMessage);
      }
    }
  } catch (error) {
    console.error('❌ sendMessage error:', error);
    toast({
      title: "Error",
      description: "An error occurred while generating the response. Please try again.",
      variant: "destructive"
    });
    
    // Update message status on error
    if (messageId != null) {
      const message = getMessage(messageId);
      if (message?.isStreaming) {
        updateMessage(messageId, { isStreaming: false });
      }
    }
    
    // Clear ongoing research on error
    const { ongoingResearchId } = useDeerFlowMessageStore.getState();
    if (ongoingResearchId) {
      useDeerFlowMessageStore.setState({ ongoingResearchId: null });
    }
  } finally {
    setIsResponding(false);
  }
}