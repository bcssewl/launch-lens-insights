/**
 * @file mergeMessage.ts
 * @description Enhanced message merging logic for DeerFlow API with robust event handling
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

// Enhanced discriminated union for DeerFlow API events with comprehensive type safety
export type StreamEvent = 
  | { event: 'message_chunk'; data: MessageChunk }
  | { event: 'tool_call'; data: { id: string; name: string; args: Record<string, any> } }
  | { event: 'tool_calls'; data: Array<{ id: string; name: string; args: Record<string, any> }> | { id: string; name: string; args: Record<string, any> } }
  | { event: 'tool_call_chunk'; data: ToolCallChunk }
  | { event: 'tool_call_chunks'; data: ToolCallChunk[] | ToolCallChunk }
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
        content?: string;
        output?: string;
        screenshot?: string;
        websites?: Array<{ url: string; title?: string; content?: string }>;
      }
    } }
  | { event: 'thinking'; data: { phase: string; content: string; progress?: number } }
  | { event: 'reasoning'; data: { step: string; content: string; reasoning_type?: 'planning' | 'analysis' | 'synthesis' } }
  | { event: 'search'; data: { query: string; results?: any[]; search_type?: 'web' | 'github' | 'academic' } }
  | { event: 'visit'; data: { url: string; title?: string; content?: string; status?: 'success' | 'failed' } }
  | { event: 'writing_report'; data: { progress?: number; section?: string; total_sections?: number } }
  | { event: 'report_generated'; data: { content: string; citations?: any[]; format?: 'markdown' | 'html' } }
  | { event: 'agent_handoff'; data: { from_agent: string; to_agent: string; context?: any } }
  | { event: 'plan_created'; data: { plan: any; steps: any[]; approval_required?: boolean } }
  | { event: 'done'; data: {} }
  | { event: 'interrupt'; data: { options?: Array<{ text: string; value: string }> } }
  | { event: 'error'; data: { error: string; error_type?: string; recoverable?: boolean } }
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

      case 'tool_calls': {
        const toolCallsData = Array.isArray(event.data) ? event.data : [event.data];
        const existingToolCalls = [...(currentMessage.toolCalls || [])];

        for (const toolCall of toolCallsData) {
          const existingIndex = existingToolCalls.findIndex(tc => tc.id === toolCall.id);
          
          if (existingIndex >= 0) {
            existingToolCalls[existingIndex] = {
              ...existingToolCalls[existingIndex],
              name: toolCall.name,
              args: toolCall.args
            };
          } else {
            existingToolCalls.push({
              id: toolCall.id,
              name: toolCall.name,
              args: toolCall.args,
              argsChunks: []
            });
          }
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
            
            // Enhanced JSON reconstruction with validation
            const completeArgsString = existingToolCalls[targetIndex].argsChunks!.join('');
            try {
              // Validate JSON completeness before parsing
              if (isValidJSON(completeArgsString)) {
                existingToolCalls[targetIndex].args = JSON.parse(completeArgsString);
              }
            } catch (e) {
              // Args not complete yet - keep accumulating chunks
              console.debug('Tool call args incomplete, continuing to accumulate chunks');
            }
          }
        }

        return {
          ...currentMessage,
          toolCalls: existingToolCalls,
          isStreaming: true
        };
      }

      case 'tool_call_chunks': {
        const chunksData = Array.isArray(event.data) ? event.data : [event.data];
        const existingToolCalls = [...(currentMessage.toolCalls || [])];

        for (const chunk of chunksData) {
          const existingIndex = existingToolCalls.findIndex(tc => tc.id === chunk.id);

          if (chunk.name && existingIndex >= 0) {
            existingToolCalls[existingIndex].name = chunk.name;
          } else if (chunk.name) {
            existingToolCalls.push({
              id: chunk.id,
              name: chunk.name,
              args: {},
              argsChunks: []
            });
          }

          if (chunk.args) {
            const targetIndex = existingToolCalls.findIndex(tc => tc.id === chunk.id);
            if (targetIndex >= 0) {
              if (!existingToolCalls[targetIndex].argsChunks) {
                existingToolCalls[targetIndex].argsChunks = [];
              }
              existingToolCalls[targetIndex].argsChunks!.push(chunk.args);
              
              const completeArgsString = existingToolCalls[targetIndex].argsChunks!.join('');
              try {
                existingToolCalls[targetIndex].args = JSON.parse(completeArgsString);
              } catch (e) {
                // Args not complete yet
              }
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
        currentMessage.metadata.reportFormat = event.data.format || 'markdown';
        return { ...currentMessage, isStreaming: false, finishReason: 'completed' };
      }

      case 'agent_handoff': {
        if (!currentMessage.metadata) currentMessage.metadata = {};
        if (!currentMessage.metadata.agentTransitions) currentMessage.metadata.agentTransitions = [];
        currentMessage.metadata.agentTransitions.push({
          from: event.data.from_agent,
          to: event.data.to_agent,
          context: event.data.context,
          timestamp: new Date()
        });
        currentMessage.metadata.agent = event.data.to_agent;
        return { ...currentMessage, isStreaming: true };
      }

      case 'plan_created': {
        if (!currentMessage.metadata) currentMessage.metadata = {};
        currentMessage.metadata.planData = event.data.plan;
        currentMessage.metadata.planSteps = event.data.steps;
        currentMessage.metadata.requiresApproval = event.data.approval_required;
        return { ...currentMessage, isStreaming: true };
      }

      case 'done': {
        return {
          ...currentMessage,
          finishReason: 'completed',
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
        
        // Parse plan steps for planner messages
        let planSteps: any[] = [];
        if (currentMessage.metadata?.agent === 'planner' && currentMessage.content) {
          try {
            const parsed = JSON.parse(currentMessage.content);
            planSteps = parsed.steps || [];
          } catch (e) {
            // If parsing fails, try to extract steps from the content
            const stepMatches = currentMessage.content.match(/\d+\.\s+(.+)/g);
            if (stepMatches) {
              planSteps = stepMatches.map(match => match.replace(/^\d+\.\s+/, ''));
            }
          }
        }
        
        return {
          ...currentMessage,
          finishReason: 'interrupt',
          isStreaming: false,
          options: options,
          metadata: {
            ...currentMessage.metadata,
            planSteps: planSteps
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

/**
 * Validates if a string is valid JSON
 */
function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Enhanced tool call validation with chunk completion check
 */
export function isToolCallReadyForExecution(toolCall: ToolCall): boolean {
  return !!(
    toolCall.name && 
    toolCall.args && 
    typeof toolCall.args === 'object' &&
    Object.keys(toolCall.args).length > 0 &&
    (!toolCall.argsChunks || toolCall.argsChunks.length === 0 || isValidJSON(toolCall.argsChunks.join('')))
  );
}