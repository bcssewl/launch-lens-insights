/**
 * @file chat.ts
 * @description Centralized data structures for chat application
 */

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, any>;
}

export interface FeedbackOption {
  title: string;
  value: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agent?: string;
  finishReason?: 'interrupt';
  options?: FeedbackOption[];
  toolCalls?: ToolCall[];
  timestamp?: Date;
  metadata?: {
    isCompleted?: boolean;
    messageType?: 'progress_update' | 'completed_report' | 'standard' | 'stratix_conversation';
  };
}

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

export interface ToolCallResultData {
  id: string;
  result: any;
  error?: string;
}

export interface ThinkingData {
  phase: string;
  content: string;
}

export interface SearchData {
  query: string;
  results?: any[];
}

export interface ReasoningData {
  step: string;
  content: string;
}

export type ChatEvent = 
  | { event: 'message_chunk'; data: MessageChunkData }
  | { event: 'tool_call'; data: ToolCallData }
  | { event: 'tool_call_result'; data: ToolCallResultData }
  | { event: 'thinking'; data: ThinkingData }
  | { event: 'search'; data: SearchData }
  | { event: 'reasoning'; data: ReasoningData }
  | { event: 'done'; data: {} }
  | { event: 'error'; data: { error: string } };

export interface StreamingState {
  isStreaming: boolean;
  currentMessage?: Partial<Message>;
  error?: string;
  phase?: string;
}