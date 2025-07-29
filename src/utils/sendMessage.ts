/**
 * @file sendMessage.ts
 * @description Exact DeerFlow sendMessage implementation for message chain management
 */

import { nanoid } from 'nanoid';
import { useDeerFlowMessageStore } from '@/stores/deerFlowMessageStore';
import { useDeerFlowSettingsStore } from '@/stores/deerFlowSettingsStore';
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

// Get real chat settings from the store
const getChatStreamSettings = (): ChatSettings => {
  console.log('🔧 Getting settings from store...');
  
  try {
    const { settings } = useDeerFlowSettingsStore.getState();
    console.log('📋 Raw store settings:', settings);
    
    if (!settings) {
      console.warn('⚠️ No settings found in store, using defaults');
      return {
        autoAcceptedPlan: false,
        enableDeepThinking: false,
        enableBackgroundInvestigation: true,
        maxPlanIterations: 3,
        maxStepNum: 10,
        maxSearchResults: 10,
        reportStyle: 'academic',
        mcpSettings: {}
      };
    }
    
    const mappedSettings = {
      autoAcceptedPlan: settings.autoAcceptedPlan,
      enableDeepThinking: settings.deepThinking,
      enableBackgroundInvestigation: settings.backgroundInvestigation,
      maxPlanIterations: settings.maxPlanIterations,
      maxStepNum: settings.maxStepNum,
      maxSearchResults: settings.maxSearchResults,
      reportStyle: settings.reportStyle,
      mcpSettings: {
        servers: settings.mcpServers.filter(server => server.enabled)
      }
    };
    
    console.log('📋 Mapped settings for API:', mappedSettings);
    return mappedSettings;
    
  } catch (error) {
    console.error('❌ Error getting settings:', error);
    // Fallback to default settings
    return {
      autoAcceptedPlan: false,
      enableDeepThinking: false,
      enableBackgroundInvestigation: true,
      maxPlanIterations: 3,
      maxStepNum: 10,
      maxSearchResults: 10,
      reportStyle: 'academic',
      mcpSettings: {}
    };
  }
};

// Real DeerFlow API call using the actual backend service
async function* chatStream(
  content: string,
  params: any,
  options: StreamOptions = {}
): AsyncGenerator<any> {
  console.log('🌊 Starting DeerFlow stream with real API:', { content, params });
  
  try {
    // Prepare the request body according to DeerFlow API schema
    const requestBody = {
      messages: content ? [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: content
            }
          ]
        }
      ] : [],
      resources: params.resources || null,
      debug: false,
      thread_id: params.thread_id || "__default__",
      max_plan_iterations: params.max_plan_iterations || 1,
      max_step_num: params.max_step_num || 3,
      max_search_results: params.max_search_results || 3,
      auto_accepted_plan: params.auto_accepted_plan || false,
      interrupt_feedback: params.interrupt_feedback || null,
      mcp_settings: params.mcp_settings || null,
      enable_background_investigation: params.enable_background_investigation ?? true,
      report_style: params.report_style || "academic",
      enable_deep_thinking: params.enable_deep_thinking || false,
    };

    console.log('📤 Sending request to DeerFlow API:', requestBody);

    // Call the real DeerFlow API
    const response = await fetch('https://deer-flow-wrappers.up.railway.app/api/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: options.abortSignal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('DeerFlow API error response:', response.status, errorText);
      throw new Error(`DeerFlow API request failed: ${response.status} - ${errorText || response.statusText}`);
    }

    if (!response.body) {
      throw new Error('No response body received from DeerFlow API');
    }

    // Parse Server-Sent Events from DeerFlow
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('🏁 DeerFlow stream completed');
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const eventData = JSON.parse(line.slice(6));
              console.log('📨 DeerFlow event:', eventData);
              console.log('🔍 RAW EVENT ANALYSIS:', {
                hasType: !!eventData.type,
                hasEvent: !!eventData.event,
                hasAgent: !!eventData.agent,
                hasDataAgent: !!eventData.data?.agent,
                hasMetadataAgent: !!eventData.metadata?.agent,
                fullStructure: JSON.stringify(eventData, null, 2)
              });
              
              // Convert DeerFlow events to our expected format
              const convertedEvent = convertDeerFlowEvent(eventData);
              if (convertedEvent) {
                console.log('✅ Converted event:', convertedEvent);
                yield convertedEvent;
              }
            } catch (parseError) {
              console.warn('Failed to parse DeerFlow SSE data:', line, parseError);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

  } catch (error) {
    console.error('❌ DeerFlow API error:', error);
    
    // If it's an abort error, don't yield error - just return
    if (error.name === 'AbortError') {
      console.log('🛑 DeerFlow stream aborted by user');
      return;
    }
    
    // Yield error event for other errors
    yield {
      type: 'error',
      data: {
        error: error.message || 'DeerFlow API connection failed'
      }
    };
  }
}

// Convert DeerFlow API events to our internal format
function convertDeerFlowEvent(deerFlowEvent: any): any | null {
  console.log('🔄 Converting DeerFlow event:', deerFlowEvent);
  
  // Extract agent information from various possible locations
  const extractAgent = (event: any): string | undefined => {
    return event.agent || 
           event.data?.agent || 
           event.metadata?.agent ||
           (event.role === 'assistant' ? 'assistant' : undefined);
  };
  
  // Extract message ID from various possible locations
  const extractId = (event: any): string => {
    return event.id || 
           event.data?.id || 
           event.metadata?.message_id || 
           nanoid();
  };
  
  // Handle simple text content
  if (typeof deerFlowEvent === 'string') {
    return {
      type: 'message_chunk',
      data: {
        id: nanoid(),
        content: deerFlowEvent,
        role: 'assistant',
        agent: 'assistant' // Default agent for simple strings
      }
    };
  }
  
    // Handle structured events
    if (typeof deerFlowEvent === 'object' && deerFlowEvent !== null) {
      const eventType = deerFlowEvent.type || deerFlowEvent.event;
      const agent = extractAgent(deerFlowEvent);
      const messageId = extractId(deerFlowEvent);
      
      console.log('🔍 Event details:', { eventType, agent, messageId, fullEvent: deerFlowEvent });
      
      // Handle tool_call_chunks specifically (this is how DeerFlow sends plan data)
      if (deerFlowEvent.tool_call_chunks && Array.isArray(deerFlowEvent.tool_call_chunks)) {
        console.log('🔧 Processing tool_call_chunks for agent:', agent);
        
        // Extract content from tool call chunks
        const content = deerFlowEvent.tool_call_chunks
          .map(chunk => chunk.args || chunk.content || '')
          .join('');
        
        return {
          type: 'message_chunk',
          data: {
            id: messageId,
            content: content,
            role: deerFlowEvent.role || 'assistant',
            agent: agent || 'assistant',
            thread_id: deerFlowEvent.thread_id,
            tool_call_chunks: deerFlowEvent.tool_call_chunks
          }
        };
      }
      
      if (eventType) {
      switch (eventType) {
        case 'content':
        case 'message':
        case 'text':
        case 'message_chunk':
          return {
            type: 'message_chunk',
            data: {
              id: messageId,
              content: deerFlowEvent.content || deerFlowEvent.text || '',
              role: deerFlowEvent.role || 'assistant',
              agent: agent || 'assistant',
              thread_id: deerFlowEvent.thread_id || deerFlowEvent.metadata?.thread_id,
              options: deerFlowEvent.options
            }
          };
          
        case 'message_start':
          return {
            type: 'message_start',
            data: {
              id: messageId,
              role: deerFlowEvent.role || 'assistant',
              agent: agent || 'assistant',
              thread_id: deerFlowEvent.thread_id || deerFlowEvent.metadata?.thread_id,
              content: deerFlowEvent.content || '',
              options: deerFlowEvent.options
            }
          };
          
        case 'message_end':
          return {
            type: 'message_end',
            data: {
              id: messageId,
              finish_reason: deerFlowEvent.finish_reason || 'stop',
              agent: agent,
              options: deerFlowEvent.options
            }
          };
          
        case 'thinking':
        case 'reasoning':
          return {
            type: 'message_chunk',
            data: {
              id: messageId,
              reasoning_content: deerFlowEvent.content || deerFlowEvent.text || '',
              role: 'assistant',
              agent: agent || 'assistant'
            }
          };
          
        case 'tool_call':
          return {
            type: 'tool_call',
            data: {
              ...(deerFlowEvent.data || deerFlowEvent),
              agent: agent
            }
          };
          
        case 'tool_call_result':
          return {
            type: 'tool_call_result',
            data: {
              ...(deerFlowEvent.data || deerFlowEvent),
              agent: agent
            }
          };
          
        case 'done':
        case 'complete':
          return {
            type: 'message_end',
            data: {
              id: messageId,
              finish_reason: 'stop',
              agent: agent
            }
          };
          
        case 'error':
          return {
            type: 'error',
            data: {
              error: deerFlowEvent.error || deerFlowEvent.data?.error || 'Unknown error',
              agent: agent
            }
          };
          
        default:
          // Pass through unknown events with agent preservation
          console.log('🔄 Passing through unknown event:', eventType);
          return {
            type: eventType,
            data: {
              ...(deerFlowEvent.data || deerFlowEvent),
              agent: agent
            }
          };
      }
    }
    
    // If no type field but has content, treat as content
    if (deerFlowEvent.content || deerFlowEvent.text) {
      return {
        type: 'message_chunk',
        data: {
          id: messageId,
          content: deerFlowEvent.content || deerFlowEvent.text || '',
          role: deerFlowEvent.role || 'assistant',
          agent: agent || 'assistant',
          thread_id: deerFlowEvent.thread_id
        }
      };
    }
  }
  
  // For unknown formats, return null to skip
  console.warn('⚠️ Unknown DeerFlow event format:', deerFlowEvent);
  return null;
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
  console.log('🚀 sendMessage called with:', { content, interruptFeedback, resources });
  
  try {
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
      console.log('🔍 STREAM EVENT DETAILS:', {
        type,
        dataAgent: data.agent,
        dataRole: data.role,
        messageId: data.id,
        hasOptions: !!data.options,
        eventStructure: event
      });
      
      // STEP 3: Handle tool call results (find existing message)
      if (type === "tool_call_result") {
        message = findMessageByToolCallId(data.tool_call_id);
      } else if (!messageId || !existsMessage(messageId)) {
        // STEP 4: Create new assistant message
        const newMessageId = messageId || nanoid();
        
        // Preserve agent information from the event data
        const agent = data.agent || 
                     (type === 'message_start' && data.agent) || 
                     'assistant';
        
        console.log('🎯 Creating new message with agent:', agent, 'from event:', type, data);
        
        message = {
          id: newMessageId,
          threadId: data.thread_id || currentThreadId,
          agent: agent,
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
        messageId = newMessageId;
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
  
  } catch (outerError) {
    console.error('❌ Critical sendMessage error:', outerError);
    toast({
      title: "Critical Error",
      description: "Failed to initialize message sending. Please try again.",
      variant: "destructive"
    });
  }
}