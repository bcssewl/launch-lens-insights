/**
 * @file mergeMessage.ts
 * @description Robust message merging logic for DeerFlow API
 */

import { DeerMessage, ToolCall } from '@/stores/deerFlowMessageStore';

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
  };
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

export interface SearchData {
  query: string;
  results?: any[];
}

export interface VisitData {
  url: string;
  title?: string;
  content?: string;
}

export interface WritingReportData {
  progress?: number;
}

export interface ReportGeneratedData {
  content: string;
  citations?: any[];
}

export interface InterruptData {
  finish_reason?: 'completed' | 'interrupt' | 'error';
  options?: Array<{ text: string; value: string }>;
}

export interface ErrorData {
  error: string;
}

export interface DoneData {
  finish_reason?: 'completed' | 'interrupt' | 'error';
}

// Strict discriminated union for DeerFlow events
export type StreamEvent = 
  | GenericEvent<MessageChunkData> & { event: 'message_chunk' }
  | GenericEvent<ToolCallData> & { event: 'tool_call' }
  | GenericEvent<ToolCallChunkData> & { event: 'tool_call_chunk' }
  | GenericEvent<ToolCallResultData> & { event: 'tool_call_result' }
  | GenericEvent<ThinkingData> & { event: 'thinking' }
  | GenericEvent<ReasoningData> & { event: 'reasoning' }
  | GenericEvent<SearchData> & { event: 'search' }
  | GenericEvent<VisitData> & { event: 'visit' }
  | GenericEvent<WritingReportData> & { event: 'writing_report' }
  | GenericEvent<ReportGeneratedData> & { event: 'report_generated' }
  | GenericEvent<DoneData> & { event: 'done' }
  | GenericEvent<InterruptData> & { event: 'interrupt' }
  | GenericEvent<ErrorData> & { event: 'error' }

/**
 * Map-based message storage for efficient lookups
 */
const messageStorage = new Map<string, DeerMessage>();

/**
 * Merges streaming events into a message object with immediate synchronous updates
 * Implements immutable message updates matching original DeerFlow behavior
 */
export function mergeMessage(
  currentMessage: Partial<DeerMessage> | null,
  event: StreamEvent
): Partial<DeerMessage> {
  // Create base message structure if none exists
  const baseMessage: Partial<DeerMessage> = currentMessage || {
    id: crypto.randomUUID(),
    role: 'assistant',
    content: '',
    toolCalls: [],
    isStreaming: true,
    metadata: {},
    timestamp: new Date()
  };

  // Extract event metadata and merge immutably
  const mergedMetadata = {
    ...baseMessage.metadata,
    ...(event.metadata || {})
  };

  // Handle each event type with immediate synchronous processing
  switch (event.event) {
    case 'message_chunk': {
      return createImmutableUpdate(baseMessage, {
        content: (baseMessage.content || '') + (event.data.content || ''),
        role: event.data.role || baseMessage.role,
        metadata: {
          ...mergedMetadata,
          agent: event.data.agent || mergedMetadata.agent
        },
        isStreaming: true
      });
    }

    case 'tool_call': {
      const updatedToolCalls = mergeToolCallImmutable(
        baseMessage.toolCalls || [],
        {
          id: event.data.id,
          name: event.data.name,
          args: event.data.args,
          argsChunks: []
        }
      );

      return createImmutableUpdate(baseMessage, {
        toolCalls: updatedToolCalls,
        metadata: mergedMetadata,
        isStreaming: true
      });
    }

    case 'tool_call_chunk': {
      const updatedToolCalls = mergeToolCallChunkImmutable(
        baseMessage.toolCalls || [],
        event.data
      );

      return createImmutableUpdate(baseMessage, {
        toolCalls: updatedToolCalls,
        metadata: mergedMetadata,
        isStreaming: true
      });
    }

    case 'tool_call_result': {
      const updatedToolCalls = mergeToolCallResultImmutable(
        baseMessage.toolCalls || [],
        event.data
      );

      return createImmutableUpdate(baseMessage, {
        toolCalls: updatedToolCalls,
        metadata: mergedMetadata,
        isStreaming: true
      });
    }

    case 'thinking': {
      const updatedThinkingPhases = [
        ...(baseMessage.metadata?.thinkingPhases || []),
        event.data
      ];

      return createImmutableUpdate(baseMessage, {
        metadata: {
          ...mergedMetadata,
          thinkingPhases: updatedThinkingPhases
        },
        isStreaming: true
      });
    }

    case 'reasoning': {
      const updatedReasoningSteps = [
        ...(baseMessage.metadata?.reasoningSteps || []),
        event.data
      ];

      return createImmutableUpdate(baseMessage, {
        metadata: {
          ...mergedMetadata,
          reasoningSteps: updatedReasoningSteps
        },
        isStreaming: true
      });
    }

    case 'search': {
      const updatedSearchActivities = [
        ...(baseMessage.metadata?.searchActivities || []),
        event.data
      ];

      return createImmutableUpdate(baseMessage, {
        metadata: {
          ...mergedMetadata,
          searchActivities: updatedSearchActivities
        },
        isStreaming: true
      });
    }

    case 'visit': {
      const updatedVisitedUrls = [
        ...(baseMessage.metadata?.visitedUrls || []),
        event.data
      ];

      return createImmutableUpdate(baseMessage, {
        metadata: {
          ...mergedMetadata,
          visitedUrls: updatedVisitedUrls
        },
        isStreaming: true
      });
    }

    case 'writing_report': {
      return createImmutableUpdate(baseMessage, {
        metadata: {
          ...mergedMetadata,
          researchState: 'generating_report'
        },
        isStreaming: true
      });
    }

    case 'report_generated': {
      return createImmutableUpdate(baseMessage, {
        metadata: {
          ...mergedMetadata,
          researchState: 'report_generated',
          reportContent: event.data.content,
          citations: event.data.citations
        },
        isStreaming: false,
        finishReason: 'completed'
      });
    }

    case 'done': {
      const finishReason = event.data.finish_reason || 'completed';
      return createImmutableUpdate(baseMessage, {
        finishReason,
        isStreaming: false,
        metadata: mergedMetadata
      });
    }

    case 'interrupt': {
      const planData = extractPlanDataImmutable(baseMessage);
      const finishReason = event.data.finish_reason || 'interrupt';
      
      return createImmutableUpdate(baseMessage, {
        finishReason,
        isStreaming: false,
        options: event.data.options || getDefaultInterruptOptions(baseMessage),
        metadata: {
          ...mergedMetadata,
          ...planData
        }
      });
    }

    case 'error': {
      return createImmutableUpdate(baseMessage, {
        content: (baseMessage.content || '') + `\n\n**Error:** ${event.data.error}`,
        isStreaming: false,
        finishReason: 'error',
        metadata: mergedMetadata
      });
    }

    default: {
      console.warn('Unknown DeerFlow event:', event);
      return createImmutableUpdate(baseMessage, {
        metadata: mergedMetadata,
        isStreaming: true
      });
    }
  }
}

/**
 * Creates an immutable update of a message
 */
function createImmutableUpdate(
  baseMessage: Partial<DeerMessage>,
  updates: Partial<DeerMessage>
): Partial<DeerMessage> {
  return {
    ...baseMessage,
    ...updates,
    timestamp: baseMessage.timestamp || new Date()
  };
}

/**
 * Immutably merges a tool call into the tool calls array
 */
function mergeToolCallImmutable(
  existingToolCalls: ToolCall[],
  newToolCall: ToolCall
): ToolCall[] {
  const existingIndex = existingToolCalls.findIndex(tc => tc.id === newToolCall.id);
  
  if (existingIndex >= 0) {
    // Replace existing tool call immutably
    return existingToolCalls.map((tc, index) => 
      index === existingIndex 
        ? { 
            ...tc, 
            ...newToolCall,
            status: 'running',
            timestamp: tc.timestamp || Date.now()
          }
        : tc
    );
  } else {
    // Add new tool call immutably with initial status
    const toolCall: ToolCall = {
      ...newToolCall,
      status: 'running',
      timestamp: Date.now()
    };
    return [...existingToolCalls, toolCall];
  }
}

/**
 * Immutably merges a tool call chunk
 */
function mergeToolCallChunkImmutable(
  existingToolCalls: ToolCall[],
  chunk: ToolCallChunkData
): ToolCall[] {
  const existingIndex = existingToolCalls.findIndex(tc => tc.id === chunk.id);

  if (chunk.name) {
    if (existingIndex >= 0) {
      // Update existing tool call with name
      return existingToolCalls.map((tc, index) =>
        index === existingIndex 
          ? { ...tc, name: chunk.name }
          : tc
      );
    } else {
      // Create new tool call with name
      return [...existingToolCalls, {
        id: chunk.id,
        name: chunk.name,
        args: {},
        argsChunks: []
      }];
    }
  }

  if (chunk.args && existingIndex >= 0) {
    // Update args chunks immutably
    const targetToolCall = existingToolCalls[existingIndex];
    const updatedArgsChunks = [...(targetToolCall.argsChunks || []), chunk.args];
    
    // Try to parse complete args
    let parsedArgs = targetToolCall.args;
    try {
      const completeArgsString = updatedArgsChunks.join('');
      parsedArgs = JSON.parse(completeArgsString);
    } catch (e) {
      // Args not complete yet, keep existing
    }

    return existingToolCalls.map((tc, index) =>
      index === existingIndex
        ? {
            ...tc,
            argsChunks: updatedArgsChunks,
            args: parsedArgs
          }
        : tc
    );
  }

  return existingToolCalls;
}

/**
 * Immutably merges a tool call result
 */
function mergeToolCallResultImmutable(
  existingToolCalls: ToolCall[],
  resultData: ToolCallResultData
): ToolCall[] {
  const existingIndex = existingToolCalls.findIndex(tc => tc.id === resultData.id);
  
  if (existingIndex >= 0) {
    return existingToolCalls.map((tc, index) =>
      index === existingIndex
        ? {
            ...tc,
            result: resultData.result,
            error: resultData.error,
            status: resultData.error ? 'error' : 'completed',
            timestamp: tc.timestamp || Date.now()
          }
        : tc
    );
  }
  
  return existingToolCalls;
}

/**
 * Extracts plan data from message content immutably
 */
function extractPlanDataImmutable(message: Partial<DeerMessage>): Partial<DeerMessage['metadata']> {
  if (message.metadata?.agent !== 'planner' || !message.content) {
    return {};
  }

  let planSteps: any[] = [];
  let hasEnoughContext = false;
  let isPlannerDirectAnswer = false;

  try {
    const parsed = JSON.parse(message.content);
    planSteps = parsed.steps || [];
    hasEnoughContext = parsed.has_enough_context || false;
    isPlannerDirectAnswer = hasEnoughContext && planSteps.length === 0;
  } catch (e) {
    // Fallback to regex parsing
    const stepMatches = message.content.match(/\d+\.\s+(.+)/g);
    if (stepMatches) {
      planSteps = stepMatches.map(match => match.replace(/^\d+\.\s+/, ''));
    }
  }

  return {
    planSteps,
    hasEnoughContext,
    isPlannerDirectAnswer
  };
}

/**
 * Gets default interrupt options based on message context
 */
function getDefaultInterruptOptions(message: Partial<DeerMessage>): Array<{ text: string; value: string }> {
  if (message.metadata?.agent === 'planner') {
    return [
      { text: 'Accept', value: 'accepted' },
      { text: 'Edit', value: 'edit' }
    ];
  }
  return [];
}

/**
 * Creates a complete message from a partial message
 */
export function finalizeMessage(
  partialMessage: Partial<DeerMessage>,
  messageId?: string
): DeerMessage {
  const finalMessage: DeerMessage = {
    id: messageId || partialMessage.id || crypto.randomUUID(),
    role: partialMessage.role || 'assistant',
    content: partialMessage.content || '',
    timestamp: partialMessage.timestamp || new Date(),
    isStreaming: false,
    finishReason: partialMessage.finishReason || 'completed',
    toolCalls: partialMessage.toolCalls || [],
    options: partialMessage.options || [],
    metadata: {
      threadId: partialMessage.metadata?.threadId,
      agent: partialMessage.metadata?.agent,
      planSteps: partialMessage.metadata?.planSteps,
      thinkingPhases: partialMessage.metadata?.thinkingPhases,
      reasoningSteps: partialMessage.metadata?.reasoningSteps,
      searchActivities: partialMessage.metadata?.searchActivities,
      visitedUrls: partialMessage.metadata?.visitedUrls,
      researchState: partialMessage.metadata?.researchState,
      reportContent: partialMessage.metadata?.reportContent,
      citations: partialMessage.metadata?.citations,
      hasEnoughContext: partialMessage.metadata?.hasEnoughContext,
      isPlannerDirectAnswer: partialMessage.metadata?.isPlannerDirectAnswer,
      ...partialMessage.metadata
    }
  };

  // Store in Map for efficient lookups
  if (finalMessage.id) {
    messageStorage.set(finalMessage.id, finalMessage);
  }

  return finalMessage;
}

/**
 * Retrieves a message from storage
 */
export function getMessageById(messageId: string): DeerMessage | undefined {
  return messageStorage.get(messageId);
}

/**
 * Removes a message from storage
 */
export function removeMessageFromStorage(messageId: string): boolean {
  return messageStorage.delete(messageId);
}

/**
 * Clears all messages from storage
 */
export function clearMessageStorage(): void {
  messageStorage.clear();
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