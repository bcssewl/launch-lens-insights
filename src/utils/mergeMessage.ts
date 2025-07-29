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
  | GenericEvent<ToolCallData> & { event: 'tool_call' }
  | GenericEvent<ToolCallChunkData> & { event: 'tool_call_chunk' }
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
 * Merges streaming events into a message object with simplified structure
 */
export function mergeMessage(
  existingMessage: Partial<DeerMessage> | null,
  event: StreamEvent
): Partial<DeerMessage> {
  // Create base message structure if none exists
  if (!existingMessage) {
    return {
      id: nanoid(),
      threadId: event.metadata?.thread_id || '',
      role: 'assistant' as const,
      content: '',
      contentChunks: [],
      toolCalls: [],
      isStreaming: true,
      timestamp: new Date()
    };
  }

  // Handle agent state
  if (event.metadata?.agent) {
    existingMessage.agent = event.metadata.agent;
  }

  // Handle each event type
  switch (event.event) {
    case 'message_chunk': {
      const contentChunks = existingMessage.contentChunks || [];
      if (event.data.content) {
        contentChunks.push(event.data.content);
      }
      
      return {
        ...existingMessage,
        content: (existingMessage.content || '') + (event.data.content || ''),
        contentChunks,
        role: event.data.role || existingMessage.role,
        agent: event.data.agent || existingMessage.agent,
        isStreaming: true
      };
    }

    case 'tool_call': {
      const mergedToolCalls = [...(existingMessage.toolCalls || [])];
      const existingIndex = mergedToolCalls.findIndex(tc => tc.id === event.data.id);
      
      if (existingIndex >= 0) {
        mergedToolCalls[existingIndex] = {
          ...mergedToolCalls[existingIndex],
          ...event.data,
          status: 'running',
          timestamp: Date.now()
        };
      } else {
        mergedToolCalls.push({
          ...event.data,
          status: 'running',
          timestamp: Date.now(),
          argsChunks: []
        });
      }

      return {
        ...existingMessage,
        toolCalls: mergedToolCalls,
        isStreaming: true
      };
    }

    case 'tool_call_chunk': {
      const mergedToolCalls = [...(existingMessage.toolCalls || [])];
      const existingIndex = mergedToolCalls.findIndex(tc => tc.id === event.data.id);
      
      if (existingIndex >= 0) {
        const toolCall = mergedToolCalls[existingIndex];
        const argsChunks = [...(toolCall.argsChunks || [])];
        
        if (event.data.name) {
          toolCall.name = event.data.name;
        }
        
        if (event.data.args) {
          argsChunks.push(event.data.args);
          
          // Try to parse complete args
          try {
            const completeArgs = JSON.parse(argsChunks.join(''));
            toolCall.args = completeArgs;
          } catch (e) {
            // Args not complete yet
          }
          
          toolCall.argsChunks = argsChunks;
        }
        
        mergedToolCalls[existingIndex] = toolCall;
      }

      return {
        ...existingMessage,
        toolCalls: mergedToolCalls,
        isStreaming: true
      };
    }

    case 'tool_call_result': {
      const mergedToolCalls = [...(existingMessage.toolCalls || [])];
      const existingIndex = mergedToolCalls.findIndex(tc => tc.id === event.data.id);
      
      if (existingIndex >= 0) {
        mergedToolCalls[existingIndex] = {
          ...mergedToolCalls[existingIndex],
          result: event.data.result,
          error: event.data.error,
          status: event.data.error ? 'error' : 'completed',
          timestamp: Date.now()
        };
      }

      return {
        ...existingMessage,
        toolCalls: mergedToolCalls,
        isStreaming: true
      };
    }

    case 'thinking':
    case 'reasoning': {
      const reasoningChunks = existingMessage.reasoningContentChunks || [];
      reasoningChunks.push(event.data.content);
      
      return {
        ...existingMessage,
        reasoningContent: (existingMessage.reasoningContent || '') + event.data.content,
        reasoningContentChunks: reasoningChunks,
        isStreaming: true
      };
    }

    case 'search':
    case 'visit':
    case 'report_generated': {
      // Handle these events but don't update message content
      return {
        ...existingMessage,
        isStreaming: true
      };
    }

    case 'done': {
      return {
        ...existingMessage,
        finishReason: event.data.finish_reason || 'stop',
        isStreaming: false
      };
    }

    case 'interrupt': {
      return {
        ...existingMessage,
        finishReason: event.data.finish_reason || 'interrupt',
        isStreaming: false
      };
    }

    case 'error': {
      return {
        ...existingMessage,
        content: (existingMessage.content || '') + `\n\n**Error:** ${event.data.error}`,
        isStreaming: false,
        finishReason: 'interrupt'
      };
    }

    default: {
      console.warn('Unknown DeerFlow event:', event);
      return {
        ...existingMessage,
        isStreaming: true
      };
    }
  }
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