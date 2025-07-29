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

// Real DeerFlow streaming API call
async function* chatStream(
  content: string,
  params: any,
  options: StreamOptions = {}
): AsyncGenerator<any> {
  console.log('🌊 Starting DeerFlow stream with backend API:', { content, params });
  
  try {
    // Get auth token from Supabase
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('No authentication token available');
    }

    // Call the DeerFlow streaming edge function
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/deerflow-stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        content,
        thread_id: params.thread_id,
        interrupt_feedback: params.interrupt_feedback,
        resources: params.resources,
        auto_accepted_plan: params.auto_accepted_plan,
        enable_deep_thinking: params.enable_deep_thinking,
        enable_background_investigation: params.enable_background_investigation,
        max_plan_iterations: params.max_plan_iterations,
        max_step_num: params.max_step_num,
        max_search_results: params.max_search_results,
        report_style: params.report_style,
        mcp_settings: params.mcp_settings,
      }),
      signal: options.abortSignal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Stream request failed: ${response.status} ${errorData.error || response.statusText}`);
    }

    if (!response.body) {
      throw new Error('No response body received from stream');
    }

    // Parse Server-Sent Events
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('🏁 Stream completed');
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const eventData = JSON.parse(line.slice(6));
              console.log('📨 Stream event:', eventData.type, eventData.data);
              yield eventData;
            } catch (parseError) {
              console.warn('Failed to parse SSE data:', line, parseError);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

  } catch (error) {
    console.error('❌ Stream error:', error);
    
    // If it's an abort error, don't yield error - just return
    if (error.name === 'AbortError') {
      console.log('🛑 Stream aborted by user');
      return;
    }
    
    // Yield error event for other errors
    yield {
      type: 'error',
      data: {
        error: error.message || 'Stream connection failed'
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