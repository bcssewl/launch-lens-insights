/**
 * @file mergeMessage.ts
 * @description Robust message merging logic for DeerFlow API
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

// Enhanced discriminated union for DeerFlow API events
export type StreamEvent = 
  | { event: 'message_chunk'; data: MessageChunk }
  | { event: 'tool_call'; data: { id: string; name: string; args: Record<string, any> } }
  | { event: 'tool_call_chunk'; data: ToolCallChunk }
  | { event: 'tool_call_result'; data: ToolCallResult & { 
      result?: {
        repositories?: Array<{
          name: string;
          description: string;
          url: string;
          stars: number;
          image_url?: string;
        }>;
        results?: Array<{
          title: string;
          snippet: string;
          url: string;
          image_url?: string;
          source?: string;
        }>;
      }
    } }
  | { event: 'thinking'; data: { phase: string; content: string } }
  | { event: 'reasoning'; data: { step: string; content: string } }
  | { event: 'search'; data: { query: string; results?: any[] } }
  | { event: 'visit'; data: { url: string; title?: string; content?: string } }
  | { event: 'writing_report'; data: { progress?: number } }
  | { event: 'report_generated'; data: { content: string; citations?: any[] } }
  | { event: 'done'; data: {} }
  | { event: 'interrupt'; data: {} }
  | { event: 'error'; data: { error: string } }
  | {
      // Legacy DeerFlow API format for backward compatibility
      thread_id?: string;
      agent?: string;
      id?: string;
      role?: string;
      content?: string;
      tool_calls?: any[];
      tool_call_chunks?: any[];
      finish_reason?: string;
    }

/**
 * Merges streaming events into a message object
 * Handles DeerFlow API format
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

  // Handle legacy DeerFlow API format (non-discriminated events)
  if ('agent' in event && event.agent) {
    currentMessage.metadata = {
      ...currentMessage.metadata,
      agent: event.agent
    };
  }

  if ('content' in event && event.content) {
    // Ensure content is always a string
    const content = typeof event.content === 'string' ? event.content : JSON.stringify(event.content);
    currentMessage.content = (currentMessage.content || '') + content;
  }

  if ('tool_call_chunks' in event && event.tool_call_chunks && event.tool_call_chunks.length > 0) {
    const existingToolCalls = [...(currentMessage.toolCalls || [])];
    
    for (const chunk of event.tool_call_chunks) {
      if (chunk.name && chunk.id) {
        const existingIndex = existingToolCalls.findIndex(tc => tc.id === chunk.id);
        if (existingIndex >= 0) {
          existingToolCalls[existingIndex].name = chunk.name;
        } else {
          existingToolCalls.push({
            id: chunk.id,
            name: chunk.name,
            args: {},
            argsChunks: []
          });
        }
      } else if (chunk.args && chunk.id) {
        const existingIndex = existingToolCalls.findIndex(tc => tc.id === chunk.id);
        if (existingIndex >= 0) {
          if (!existingToolCalls[existingIndex].argsChunks) {
            existingToolCalls[existingIndex].argsChunks = [];
          }
          existingToolCalls[existingIndex].argsChunks!.push(chunk.args);
          
          const completeArgsString = existingToolCalls[existingIndex].argsChunks!.join('');
          try {
            existingToolCalls[existingIndex].args = JSON.parse(completeArgsString);
          } catch (e) {
            // Args not complete yet
          }
        }
      }
    }
    
    currentMessage.toolCalls = existingToolCalls;
  }

  if ('tool_calls' in event && event.tool_calls && event.tool_calls.length > 0) {
    const existingToolCalls = [...(currentMessage.toolCalls || [])];
    
    for (const toolCall of event.tool_calls) {
      if (toolCall.id && toolCall.name) {
        const existingIndex = existingToolCalls.findIndex(tc => tc.id === toolCall.id);
        if (existingIndex >= 0) {
          existingToolCalls[existingIndex] = {
            ...existingToolCalls[existingIndex],
            name: toolCall.name,
            args: toolCall.args || {}
          };
        } else {
          existingToolCalls.push({
            id: toolCall.id,
            name: toolCall.name,
            args: toolCall.args || {},
            argsChunks: []
          });
        }
      }
    }
    
    currentMessage.toolCalls = existingToolCalls;
  }

  if ('finish_reason' in event && event.finish_reason) {
    currentMessage.finishReason = event.finish_reason === 'tool_calls' ? 'completed' : 'interrupt';
    currentMessage.isStreaming = false;
  }

  // Handle discriminated union events
  if ('event' in event && event.event) {
    switch (event.event) {
      case 'message_chunk': {
        return {
          ...currentMessage,
          content: (currentMessage.content || '') + (event.data.content || ''),
          role: event.data.role || currentMessage.role,
          metadata: {
            ...currentMessage.metadata,
            agent: event.data.agent || currentMessage.metadata?.agent
          },
          isStreaming: true
        };
      }

      case 'tool_call': {
        const newToolCall: ToolCall = {
          id: event.data.id,
          name: event.data.name,
          args: event.data.args,
          argsChunks: []
        };

        const existingToolCalls = currentMessage.toolCalls || [];
        const existingIndex = existingToolCalls.findIndex(tc => tc.id === event.data.id);

        if (existingIndex >= 0) {
          existingToolCalls[existingIndex] = {
            ...existingToolCalls[existingIndex],
            ...newToolCall
          };
        } else {
          existingToolCalls.push(newToolCall);
        }

        return {
          ...currentMessage,
          toolCalls: existingToolCalls,
          isStreaming: true
        };
      }

      case 'tool_call_chunk': {
        const existingToolCalls = [...(currentMessage.toolCalls || [])];
        const existingIndex = existingToolCalls.findIndex(tc => tc.id === event.data.id);

        if (event.data.name && existingIndex >= 0) {
          existingToolCalls[existingIndex].name = event.data.name;
        } else if (event.data.name) {
          existingToolCalls.push({
            id: event.data.id,
            name: event.data.name,
            args: {},
            argsChunks: []
          });
        }

        if (event.data.args) {
          const targetIndex = existingToolCalls.findIndex(tc => tc.id === event.data.id);
          if (targetIndex >= 0) {
            if (!existingToolCalls[targetIndex].argsChunks) {
              existingToolCalls[targetIndex].argsChunks = [];
            }
            existingToolCalls[targetIndex].argsChunks!.push(event.data.args);
            
            const completeArgsString = existingToolCalls[targetIndex].argsChunks!.join('');
            try {
              existingToolCalls[targetIndex].args = JSON.parse(completeArgsString);
            } catch (e) {
              // Args not complete yet
            }
          }
        }

        return {
          ...currentMessage,
          toolCalls: existingToolCalls,
          isStreaming: true
        };
      }

      case 'tool_call_result': {
        const existingToolCalls = [...(currentMessage.toolCalls || [])];
        const toolCallIndex = existingToolCalls.findIndex(tc => tc.id === event.data.id);

        if (toolCallIndex >= 0) {
          existingToolCalls[toolCallIndex] = {
            ...existingToolCalls[toolCallIndex],
            result: event.data.result,
            error: event.data.error
          };
        }

        return {
          ...currentMessage,
          toolCalls: existingToolCalls,
          isStreaming: true
        };
      }

      case 'thinking': {
        if (!currentMessage.metadata) currentMessage.metadata = {};
        if (!currentMessage.metadata.thinkingPhases) currentMessage.metadata.thinkingPhases = [];
        currentMessage.metadata.thinkingPhases.push(event.data);
        return { ...currentMessage, isStreaming: true };
      }

      case 'reasoning': {
        if (!currentMessage.metadata) currentMessage.metadata = {};
        if (!currentMessage.metadata.reasoningSteps) currentMessage.metadata.reasoningSteps = [];
        currentMessage.metadata.reasoningSteps.push(event.data);
        return { ...currentMessage, isStreaming: true };
      }

      case 'search': {
        if (!currentMessage.metadata) currentMessage.metadata = {};
        if (!currentMessage.metadata.searchActivities) currentMessage.metadata.searchActivities = [];
        currentMessage.metadata.searchActivities.push(event.data);
        return { ...currentMessage, isStreaming: true };
      }

      case 'visit': {
        if (!currentMessage.metadata) currentMessage.metadata = {};
        if (!currentMessage.metadata.visitedUrls) currentMessage.metadata.visitedUrls = [];
        currentMessage.metadata.visitedUrls.push(event.data);
        return { ...currentMessage, isStreaming: true };
      }

      case 'writing_report': {
        if (!currentMessage.metadata) currentMessage.metadata = {};
        currentMessage.metadata.researchState = 'generating_report';
        return { ...currentMessage, isStreaming: true };
      }

      case 'report_generated': {
        if (!currentMessage.metadata) currentMessage.metadata = {};
        currentMessage.metadata.researchState = 'report_generated';
        currentMessage.metadata.reportContent = event.data.content;
        currentMessage.metadata.citations = event.data.citations;
        return { ...currentMessage, isStreaming: false, finishReason: 'completed' };
      }

      case 'done': {
        return {
          ...currentMessage,
          finishReason: 'completed',
          isStreaming: false
        };
      }

      case 'interrupt': {
        return {
          ...currentMessage,
          finishReason: 'interrupt',
          isStreaming: false
        };
      }

      case 'error': {
        return {
          ...currentMessage,
          content: (currentMessage.content || '') + `\n\n**Error:** ${event.data.error}`,
          isStreaming: false,
          finishReason: 'error'
        };
      }

      default: {
        // Handle unknown events by safely converting to string
        console.warn('Unknown DeerFlow event:', event);
        return {
          ...currentMessage,
          isStreaming: true
        };
      }
    }
  }
  
  return currentMessage;
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