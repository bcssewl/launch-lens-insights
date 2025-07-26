interface DeerFlowChatRequest {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  resources?: string[];
  debug?: boolean;
  thread_id?: string;
  max_plan_iterations?: number;
  max_step_num?: number;
  max_search_results?: number;
  auto_accepted_plan?: boolean;
  interrupt_feedback?: string;
  mcp_settings?: Record<string, any>;
  enable_background_investigation?: boolean;
  report_style?: 'academic' | 'business' | 'technical' | 'general';
  enable_deep_thinking?: boolean;
}

interface DeerFlowStreamEvent {
  type: 'message' | 'thinking' | 'planning' | 'searching' | 'analyzing' | 'complete' | 'error';
  data?: any;
  content?: string;
  error?: string;
}

class DeerFlowService {
  private static instance: DeerFlowService;
  private baseUrl = 'https://deer-flow-wrappers.up.railway.app';

  static getInstance(): DeerFlowService {
    if (!DeerFlowService.instance) {
      DeerFlowService.instance = new DeerFlowService();
    }
    return DeerFlowService.instance;
  }

  async startResearch(
    request: DeerFlowChatRequest,
    onEvent: (event: DeerFlowStreamEvent) => void
  ): Promise<void> {
    try {
      console.log('🦌 Starting DeerFlow research with config:', request);

      const response = await fetch(`${this.baseUrl}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      onEvent({ type: 'message', content: 'Research started...' });

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          onEvent({ type: 'complete' });
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.trim()) {
            try {
              // Try to parse as JSON event
              const event = JSON.parse(line);
              onEvent(event);
            } catch {
              // If not JSON, treat as text content
              if (line.trim()) {
                onEvent({ type: 'message', content: line });
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ DeerFlow research error:', error);
      onEvent({ 
        type: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const deerflowService = DeerFlowService.getInstance();
export type { DeerFlowChatRequest, DeerFlowStreamEvent };