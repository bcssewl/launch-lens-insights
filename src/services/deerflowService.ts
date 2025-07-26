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
  report_style?: 'academic' | 'popular_science' | 'news' | 'social_media';
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

      // Ensure the request matches the exact API format
      const payload = {
        messages: request.messages || [],
        resources: request.resources || [],
        debug: request.debug || false,
        thread_id: request.thread_id || "__default__",
        max_plan_iterations: request.max_plan_iterations || 1,
        max_step_num: request.max_step_num || 3,
        max_search_results: request.max_search_results || 3,
        auto_accepted_plan: request.auto_accepted_plan || false,
        interrupt_feedback: request.interrupt_feedback || "string",
        mcp_settings: request.mcp_settings || {},
        enable_background_investigation: request.enable_background_investigation ?? true,
        report_style: request.report_style || "academic",
        enable_deep_thinking: request.enable_deep_thinking || false
      };

      console.log('📤 Sending to DeerFlow API:', JSON.stringify(payload, null, 2));

      const response = await fetch(`${this.baseUrl}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ DeerFlow API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
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