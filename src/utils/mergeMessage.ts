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

export interface StreamEvent {
  event?: 'message_chunk' | 'tool_call' | 'tool_call_chunk' | 'tool_call_result' | 'interrupt' | 'done' | 'error' | 'thinking' | 'reasoning' | 'search' | 'visit' | 'writing_report' | 'report_generated';
  data?: MessageChunk | ToolCallChunk | ToolCallResult | { error: string } | {};
  // DeerFlow API format
  thread_id?: string;
  agent?: string;
  id?: string;
  role?: string;
  content?: string;
  tool_calls?: any[];
  tool_call_chunks?: any[];
  finish_reason?: string;
  
  // New DeerFlow event types
  thinking?: { phase: string; content: string };
  reasoning?: { step: string; content: string };
  search?: { query: string; results?: any[] };
  visit?: { url: string; title?: string; content?: string };
  writing_report?: boolean;
  report_generated?: { content: string; citations?: any[] };
}

/**
 * Merges streaming events into a message object
 * Handles DeerFlow API format
 */
export function mergeMessage(
  currentMessage: Partial<DeerMessage> | null,
  event: StreamEvent
): Partial<DeerMessage> {
  // console.log('🔄 DeerFlow Event:', event); // Debug logging

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

  // Handle DeerFlow API format directly
  if (event.agent) {
    currentMessage.metadata = {
      ...currentMessage.metadata,
      agent: event.agent
    };
  }

  if (event.content) {
    currentMessage.content = (currentMessage.content || '') + event.content;
  }

  // Handle new DeerFlow event types
  if (event.thinking) {
    if (!currentMessage.metadata) currentMessage.metadata = {};
    if (!currentMessage.metadata.thinkingPhases) currentMessage.metadata.thinkingPhases = [];
    currentMessage.metadata.thinkingPhases.push(event.thinking);
  }

  if (event.reasoning) {
    if (!currentMessage.metadata) currentMessage.metadata = {};
    if (!currentMessage.metadata.reasoningSteps) currentMessage.metadata.reasoningSteps = [];
    currentMessage.metadata.reasoningSteps.push(event.reasoning);
  }

  if (event.search) {
    if (!currentMessage.metadata) currentMessage.metadata = {};
    if (!currentMessage.metadata.searchActivities) currentMessage.metadata.searchActivities = [];
    currentMessage.metadata.searchActivities.push(event.search);
  }

  if (event.visit) {
    if (!currentMessage.metadata) currentMessage.metadata = {};
    if (!currentMessage.metadata.visitedUrls) currentMessage.metadata.visitedUrls = [];
    currentMessage.metadata.visitedUrls.push(event.visit);
  }

  if (event.writing_report) {
    if (!currentMessage.metadata) currentMessage.metadata = {};
    currentMessage.metadata.researchState = 'generating_report';
  }

  if (event.report_generated) {
    if (!currentMessage.metadata) currentMessage.metadata = {};
    currentMessage.metadata.researchState = 'report_generated';
    currentMessage.metadata.reportContent = event.report_generated.content;
    currentMessage.metadata.citations = event.report_generated.citations;
  }

  if (event.tool_call_chunks && event.tool_call_chunks.length > 0) {
    const existingToolCalls = [...(currentMessage.toolCalls || [])];
    
    for (const chunk of event.tool_call_chunks) {
      if (chunk.name && chunk.id) {
        // This is a new tool call
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
        // This is argument data for existing tool call
        const existingIndex = existingToolCalls.findIndex(tc => tc.id === chunk.id);
        if (existingIndex >= 0) {
          if (!existingToolCalls[existingIndex].argsChunks) {
            existingToolCalls[existingIndex].argsChunks = [];
          }
          existingToolCalls[existingIndex].argsChunks!.push(chunk.args);
          
          // Try to reconstruct complete args
          const completeArgsString = existingToolCalls[existingIndex].argsChunks!.join('');
          try {
            existingToolCalls[existingIndex].args = JSON.parse(completeArgsString);
          } catch (e) {
            // Args not complete yet
          }
        } else {
          // Create new tool call for the chunk args (with null id - handle gracefully)
          const newId = `temp_${Date.now()}`;
          existingToolCalls.push({
            id: newId,
            name: '',
            args: {},
            argsChunks: [chunk.args]
          });
        }
      }
    }
    
    currentMessage.toolCalls = existingToolCalls;
  }

  if (event.tool_calls && event.tool_calls.length > 0) {
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

  if (event.finish_reason) {
    currentMessage.finishReason = event.finish_reason === 'tool_calls' ? 'completed' : 'interrupt';
    currentMessage.isStreaming = false;
  }

  // Handle standard SSE event format if available
  if (event.event) {
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

      case 'thinking': {
        const thinkingData = event.data as { phase: string; content: string };
        if (!currentMessage.metadata) currentMessage.metadata = {};
        if (!currentMessage.metadata.thinkingPhases) currentMessage.metadata.thinkingPhases = [];
        currentMessage.metadata.thinkingPhases.push(thinkingData);
        return { ...currentMessage, isStreaming: true };
      }

      case 'reasoning': {
        const reasoningData = event.data as { step: string; content: string };
        if (!currentMessage.metadata) currentMessage.metadata = {};
        if (!currentMessage.metadata.reasoningSteps) currentMessage.metadata.reasoningSteps = [];
        currentMessage.metadata.reasoningSteps.push(reasoningData);
        return { ...currentMessage, isStreaming: true };
      }

      case 'search': {
        const searchData = event.data as { query: string; results?: any[] };
        if (!currentMessage.metadata) currentMessage.metadata = {};
        if (!currentMessage.metadata.searchActivities) currentMessage.metadata.searchActivities = [];
        currentMessage.metadata.searchActivities.push(searchData);
        return { ...currentMessage, isStreaming: true };
      }

      case 'visit': {
        const visitData = event.data as { url: string; title?: string; content?: string };
        if (!currentMessage.metadata) currentMessage.metadata = {};
        if (!currentMessage.metadata.visitedUrls) currentMessage.metadata.visitedUrls = [];
        currentMessage.metadata.visitedUrls.push(visitData);
        return { ...currentMessage, isStreaming: true };
      }

      case 'writing_report': {
        if (!currentMessage.metadata) currentMessage.metadata = {};
        currentMessage.metadata.researchState = 'generating_report';
        return { ...currentMessage, isStreaming: true };
      }

      case 'report_generated': {
        const reportData = event.data as { content: string; citations?: any[] };
        if (!currentMessage.metadata) currentMessage.metadata = {};
        currentMessage.metadata.researchState = 'report_generated';
        currentMessage.metadata.reportContent = reportData.content;
        currentMessage.metadata.citations = reportData.citations;
        return { ...currentMessage, isStreaming: false, finishReason: 'completed' };
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

      case 'tool_call_result': {
        const resultData = event.data as { id: string; result: any; error?: string };
        const existingToolCalls = [...(currentMessage.toolCalls || [])];
        const toolCallIndex = existingToolCalls.findIndex(tc => tc.id === resultData.id);

        if (toolCallIndex >= 0) {
          existingToolCalls[toolCallIndex] = {
            ...existingToolCalls[toolCallIndex],
            result: resultData.result,
            error: resultData.error
          };
        }

        return {
          ...currentMessage,
          toolCalls: existingToolCalls,
          isStreaming: true
        };
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
        const errorData = event.data as { error: string };
        return {
          ...currentMessage,
          content: (currentMessage.content || '') + `\n\n**Error:** ${errorData.error}`,
          isStreaming: false,
          finishReason: 'interrupt'
        };
      }

      default: {
        // Fallback for unknown events
        console.warn('Unknown DeerFlow event:', event.event, event.data);
        const unknownContent = typeof event.data === 'string' 
          ? event.data 
          : JSON.stringify(event.data || '');
        return {
          ...currentMessage,
          content: (currentMessage.content || '') + (unknownContent ? `\n${unknownContent}` : ''),
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