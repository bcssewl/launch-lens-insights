/**
 * @file mergeMessage.ts
 * @description Simplified message merging logic for DeerFlow API
 */

import { DeerMessage, ToolCall } from '@/stores/deerFlowMessageStore';
import { nanoid } from 'nanoid';

// Base interface for all DeerFlow events
export interface GenericEvent<T = any> {
  event: string;
  data: T;
  metadata?: {
    timestamp?: string;
    message_id?: string;
    thread_id?: string;
    agent?: string;
  };
}

// Specific event data interfaces
export interface MessageChunkData {
  content: string;
  role?: 'assistant';
  agent?: string;
  reasoning_content?: string;
  finish_reason?: 'stop' | 'interrupt' | 'tool_calls';
  id?: string;
  message_id?: string;
}

export interface ToolCallData {
  id: string;
  name: string;
  args: Record<string, any>;
}

export interface ToolCallChunkData {
  id: string;
  name?: string;
  args?: string;
  index?: number;
}

export interface ToolCallResultData {
  id: string;
  result?: any;
  error?: string;
}

export interface ThinkingData {
  phase: string;
  content: string;
}

export interface ReasoningData {
  step: string;
  content: string;
}

export interface InterruptData {
  finish_reason?: 'stop' | 'interrupt' | 'tool_calls';
}

export interface ErrorData {
  error: string;
}

export interface DoneData {
  finish_reason?: 'stop' | 'interrupt' | 'tool_calls';
}

// Strict discriminated union for DeerFlow events
export type StreamEvent = 
  | GenericEvent<MessageChunkData> & { event: 'message_chunk' }
  | GenericEvent<ToolCallData> & { event: 'tool_call' | 'tool_calls' }
  | GenericEvent<ToolCallChunkData> & { event: 'tool_call_chunk' | 'tool_call_chunks' }
  | GenericEvent<ToolCallResultData> & { event: 'tool_call_result' }
  | GenericEvent<ThinkingData> & { event: 'thinking' }
  | GenericEvent<ReasoningData> & { event: 'reasoning' }
  | GenericEvent<any> & { event: 'search' }
  | GenericEvent<any> & { event: 'visit' }
  | GenericEvent<any> & { event: 'report_generated' }
  | GenericEvent<DoneData> & { event: 'done' }
  | GenericEvent<InterruptData> & { event: 'interrupt' }
  | GenericEvent<ErrorData> & { event: 'error' }

/**
 * Merges streaming events into a message object with DeerFlow exact behavior
 */
export function mergeMessage(message: DeerMessage, event: any): Partial<DeerMessage> {
  const { type, data } = event;
  const result: Partial<DeerMessage> = {};
  
  // Handle different event types from sendMessage stream
  switch (type) {
    case 'message_start':
      // Initialize message properties
      result.id = data.id;
      result.threadId = data.thread_id;
      result.role = data.role || 'assistant';
      result.agent = data.agent;
      result.content = data.content || '';
      result.contentChunks = [];
      result.isStreaming = true;
      result.timestamp = new Date();
      if (data.options) {
        result.options = data.options;
      }
      break;
      
    case 'message_chunk':
      // Accumulate content chunks
      if (data.content) {
        result.content = (message.content || '') + data.content;
        result.contentChunks = [...(message.contentChunks || []), data.content];
      }
      
      // Handle reasoning content
      if (data.reasoning_content) {
        result.reasoningContent = (message.reasoningContent || '') + data.reasoning_content;
        result.reasoningContentChunks = [...(message.reasoningContentChunks || []), data.reasoning_content];
      }
      break;
      
    case 'message_end':
      // Finalize message
      result.isStreaming = false;
      result.finishReason = data.finish_reason || 'stop';
      if (data.options) {
        result.options = data.options;
      }
      break;
      
    case 'tool_call_result':
      // Handle tool call results
      if (message.toolCalls) {
        const updatedToolCalls = message.toolCalls.map(tc => 
          tc.id === data.tool_call_id 
            ? { ...tc, result: data.result, status: 'completed' as const }
            : tc
        );
        result.toolCalls = updatedToolCalls;
      }
      break;
      
    default:
      // Handle other event types as needed
      console.log('🔄 Unhandled event type:', type, data);
      break;
  }
  
  return result;
}

/**
 * Safely accesses reasoning content from message
 */
export const getReasoningContent = (message: DeerMessage): string => {
  return message.reasoningContent || '';
};

/**
 * Safely accesses agent from message
 */
export const getMessageAgent = (message: DeerMessage): string | undefined => {
  return message.agent;
};

/**
 * Creates a complete message from partial data
 */
export const createCompleteMessage = (partial: Partial<DeerMessage>): DeerMessage => {
  const finishReason = partial.finishReason === 'stop' ? 'stop' : 
                      partial.finishReason === 'interrupt' ? 'interrupt' :
                      partial.finishReason === 'tool_calls' ? 'tool_calls' : 'stop';

  return {
    id: partial.id || nanoid(),
    threadId: partial.threadId || '',
    role: partial.role || 'assistant',
    content: partial.content || '',
    contentChunks: partial.contentChunks || [],
    timestamp: partial.timestamp || new Date(),
    isStreaming: partial.isStreaming ?? false,
    finishReason,
    toolCalls: partial.toolCalls,
    reasoningContent: partial.reasoningContent,
    reasoningContentChunks: partial.reasoningContentChunks,
    agent: partial.agent
  };
};

// Legacy alias for backward compatibility
export const finalizeMessage = createCompleteMessage;

/**
 * Validates if a tool call is complete
 */
export function isToolCallComplete(toolCall: ToolCall): boolean {
  return !!(toolCall.name && toolCall.args && typeof toolCall.args === 'object');
}

/**
 * Gets incomplete tool calls from a message
 */
export function getIncompleteToolCalls(message: Partial<DeerMessage>): ToolCall[] {
  return (message.toolCalls || []).filter(tc => !isToolCallComplete(tc));
}