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
 * Merges streaming events into a message object
 * Handles strict DeerFlow API format
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

  // Extract metadata from event
  if (event.metadata) {
    currentMessage.metadata = {
      ...currentMessage.metadata,
      ...event.metadata
    };
  }

  // Handle strict discriminated union events
  switch (event.event) {
    case 'message_chunk': {
      const newContent = event.data.content || '';
      const currentContent = currentMessage.content || '';
      const agent = event.data.agent || currentMessage.metadata?.agent;
      
      console.log(`🔤 Merging message chunk from ${agent}: "${newContent.substring(0, 50)}..."`);
      
      return {
        ...currentMessage,
        content: currentContent + newContent,
        role: event.data.role || currentMessage.role,
        metadata: {
          ...currentMessage.metadata,
          agent: agent
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
      const finishReason = event.data.finish_reason || 'completed';
      return {
        ...currentMessage,
        finishReason,
        isStreaming: false
      };
    }

    case 'interrupt': {
      // Default options for planner messages that are interrupted
      const defaultOptions = [
        { text: 'Accept', value: 'accepted' },
        { text: 'Edit', value: 'edit' }
      ];
      
      // Use provided options or defaults for planner messages
      const options = event.data.options || 
        (currentMessage.metadata?.agent === 'planner' ? defaultOptions : undefined);
      
      // Parse plan data for planner messages
      let planSteps: any[] = [];
      let hasEnoughContext = false;
      let isPlannerDirectAnswer = false;
      
      if (currentMessage.metadata?.agent === 'planner' && currentMessage.content) {
        try {
          const parsed = JSON.parse(currentMessage.content);
          planSteps = parsed.steps || [];
          hasEnoughContext = parsed.has_enough_context || false;
          // If planner says has enough context and no steps, it's indicating direct answer
          isPlannerDirectAnswer = hasEnoughContext && planSteps.length === 0;
        } catch (e) {
          // JSON parsing failed, try regex fallback for plain text
          console.log('🔍 JSON parsing failed for planner content, using regex fallback');
          const stepMatches = currentMessage.content.match(/\d+\.\s+(.+)/g);
          if (stepMatches) {
            planSteps = stepMatches.map(match => match.replace(/^\d+\.\s+/, ''));
          }
        }
      }
      
      const finishReason = event.data.finish_reason || 'interrupt';
      return {
        ...currentMessage,
        finishReason,
        isStreaming: false,
        options: options,
        metadata: {
          ...currentMessage.metadata,
          planSteps: planSteps,
          hasEnoughContext: hasEnoughContext,
          isPlannerDirectAnswer: isPlannerDirectAnswer
        }
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
      threadId: partialMessage.metadata?.threadId,
      // Ensure optional fields are properly typed
      planSteps: partialMessage.metadata?.planSteps,
      thinkingPhases: partialMessage.metadata?.thinkingPhases,
      researchState: partialMessage.metadata?.researchState
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