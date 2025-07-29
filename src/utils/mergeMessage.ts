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
 * Merges streaming events into a message object with simplified structure
 */
export function mergeMessage(message: DeerMessage, event: StreamEvent): DeerMessage {
  const result = { ...message };
  
  if (event.event === "message_chunk") {
    // Handle content like original
    if (event.data.content) {
      result.content += event.data.content;
      result.contentChunks.push(event.data.content);
    }
    
    // Handle reasoning content like original
    if (event.data.reasoning_content) {
      result.reasoningContent = (result.reasoningContent ?? "") + event.data.reasoning_content;
      result.reasoningContentChunks = result.reasoningContentChunks ?? [];
      result.reasoningContentChunks.push(event.data.reasoning_content);
    }
    
    // Update agent if provided
    if (event.data.agent) {
      result.agent = event.data.agent;
    }
  }
  
  // Handle finish reason like original
  if (event.data.finish_reason) {
    result.finishReason = event.data.finish_reason;
    result.isStreaming = false;
    
    // Process tool call args like original
    if (result.toolCalls) {
      result.toolCalls.forEach((toolCall) => {
        if (toolCall.argsChunks?.length) {
          toolCall.args = JSON.parse(toolCall.argsChunks.join(""));
          delete toolCall.argsChunks;
        }
      });
    }
  }
  
  // Handle tool calls like original - only create tool calls if they have a name
  if (event.event === "tool_calls" || event.event === "tool_call_chunks") {
    const toolCalls = result.toolCalls || [];
    
    if (event.event === "tool_calls" && event.data.name) {
      // Complete tool call - only if it has a name
      const existingIndex = toolCalls.findIndex(tc => tc.id === event.data.id);
      if (existingIndex >= 0) {
        toolCalls[existingIndex] = {
          ...toolCalls[existingIndex],
          ...event.data,
          status: 'running',
          timestamp: Date.now()
        };
      } else {
        toolCalls.push({
          ...event.data,
          status: 'running',
          timestamp: Date.now(),
          argsChunks: []
        });
      }
    } else if (event.event === "tool_call_chunks") {
      // Tool call chunk
      const existingIndex = toolCalls.findIndex(tc => tc.id === event.data.id);
      if (existingIndex >= 0) {
        const toolCall = toolCalls[existingIndex];
        const argsChunks = [...(toolCall.argsChunks || [])];
        
        if (event.data.name) {
          toolCall.name = event.data.name;
        }
        
        if (event.data.args) {
          argsChunks.push(event.data.args);
          toolCall.argsChunks = argsChunks;
          
          // Try to parse complete args
          try {
            const completeArgs = JSON.parse(argsChunks.join(''));
            toolCall.args = completeArgs;
          } catch (e) {
            // Args not complete yet
          }
        }
        
        toolCalls[existingIndex] = toolCall;
      }
    }
    
    result.toolCalls = toolCalls;
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