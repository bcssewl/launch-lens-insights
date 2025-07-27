/**
 * @file mergeMessage.ts
 * @description Robust message merging logic from original DeerFlow
 */

import { DeerMessage, ToolCall } from '@/stores/deerFlowMessageStore';

export interface MessageChunk {
  content?: string;
  role?: 'assistant';
  agent?: string;
}

export interface ToolCallChunk {
  id: string;
  name?: string;
  args?: string;
  index?: number;
}

export interface ToolCallResult {
  id: string;
  result?: any;
  error?: string;
}

export interface StreamEvent {
  event: 'message_chunk' | 'tool_call' | 'tool_call_chunk' | 'tool_call_result' | 'interrupt' | 'done' | 'error';
  data: MessageChunk | ToolCallChunk | ToolCallResult | { error: string } | {};
}

/**
 * Merges streaming events into a message object
 * Based on the original DeerFlow mergeMessage function
 */
export function mergeMessage(
  currentMessage: Partial<DeerMessage> | null,
  event: StreamEvent
): Partial<DeerMessage> {
  // Initialize message if it doesn't exist
  if (!currentMessage) {
    currentMessage = {
      role: 'assistant',
      content: '',
      toolCalls: [],
      isStreaming: true,
      metadata: {}
    };
  }

  switch (event.event) {
    case 'message_chunk': {
      const chunk = event.data as MessageChunk;
      return {
        ...currentMessage,
        content: (currentMessage.content || '') + (chunk.content || ''),
        role: chunk.role || currentMessage.role,
        metadata: {
          ...currentMessage.metadata,
          agent: chunk.agent || currentMessage.metadata?.agent
        },
        isStreaming: true
      };
    }

    case 'tool_call': {
      const toolCall = event.data as ToolCallChunk & { name: string; args: Record<string, any> };
      const newToolCall: ToolCall = {
        id: toolCall.id,
        name: toolCall.name,
        args: toolCall.args,
        argsChunks: []
      };

      const existingToolCalls = currentMessage.toolCalls || [];
      const existingIndex = existingToolCalls.findIndex(tc => tc.id === toolCall.id);

      if (existingIndex >= 0) {
        // Update existing tool call
        existingToolCalls[existingIndex] = {
          ...existingToolCalls[existingIndex],
          ...newToolCall
        };
      } else {
        // Add new tool call
        existingToolCalls.push(newToolCall);
      }

      return {
        ...currentMessage,
        toolCalls: existingToolCalls,
        isStreaming: true
      };
    }

    case 'tool_call_chunk': {
      const chunk = event.data as ToolCallChunk;
      const existingToolCalls = [...(currentMessage.toolCalls || [])];
      const toolCallIndex = existingToolCalls.findIndex(tc => tc.id === chunk.id);

      if (toolCallIndex >= 0) {
        const existingToolCall = existingToolCalls[toolCallIndex];
        
        // Initialize argsChunks if not present
        if (!existingToolCall.argsChunks) {
          existingToolCall.argsChunks = [];
        }

        // Add chunk to argsChunks array
        if (chunk.args) {
          existingToolCall.argsChunks.push(chunk.args);
          
          // Try to reconstruct complete args from chunks
          const completeArgsString = existingToolCall.argsChunks.join('');
          try {
            existingToolCall.args = JSON.parse(completeArgsString);
          } catch (e) {
            // Args not complete yet, keep accumulating
          }
        }

        // Update name if provided
        if (chunk.name) {
          existingToolCall.name = chunk.name;
        }

        existingToolCalls[toolCallIndex] = existingToolCall;
      } else {
        // Create new tool call for chunk
        const newToolCall: ToolCall = {
          id: chunk.id,
          name: chunk.name || '',
          args: {},
          argsChunks: chunk.args ? [chunk.args] : []
        };
        existingToolCalls.push(newToolCall);
      }

      return {
        ...currentMessage,
        toolCalls: existingToolCalls,
        isStreaming: true
      };
    }

    case 'tool_call_result': {
      const result = event.data as ToolCallResult;
      const existingToolCalls = [...(currentMessage.toolCalls || [])];
      const toolCallIndex = existingToolCalls.findIndex(tc => tc.id === result.id);

      if (toolCallIndex >= 0) {
        existingToolCalls[toolCallIndex] = {
          ...existingToolCalls[toolCallIndex],
          result: result.result,
          error: result.error
        };
      }

      return {
        ...currentMessage,
        toolCalls: existingToolCalls,
        isStreaming: true
      };
    }

    case 'interrupt': {
      return {
        ...currentMessage,
        finishReason: 'interrupt',
        isStreaming: false
      };
    }

    case 'done': {
      return {
        ...currentMessage,
        finishReason: 'completed',
        isStreaming: false
      };
    }

    case 'error': {
      const errorData = event.data as { error: string };
      return {
        ...currentMessage,
        content: (currentMessage.content || '') + `\n\n**Error:** ${errorData.error}`,
        isStreaming: false,
        finishReason: 'interrupt'
      };
    }

    default:
      return currentMessage;
  }
}

/**
 * Creates a complete message from a partial message
 */
export function finalizeMessage(
  partialMessage: Partial<DeerMessage>,
  messageId?: string
): DeerMessage {
  const timestamp = new Date();
  
  return {
    id: messageId || crypto.randomUUID(),
    role: partialMessage.role || 'assistant',
    content: partialMessage.content || '',
    timestamp,
    isStreaming: false,
    finishReason: partialMessage.finishReason || 'completed',
    toolCalls: partialMessage.toolCalls || [],
    options: partialMessage.options || [],
    metadata: {
      ...partialMessage.metadata,
      threadId: partialMessage.metadata?.threadId
    }
  };
}

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
