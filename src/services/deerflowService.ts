interface DeerFlowChatRequest {
  query: string;
  research_mode?: 'academic' | 'business' | 'technical' | 'general';
  max_plan_iterations?: number;
  max_step_num?: number;
  auto_accept_plan?: boolean;
  thinking_on?: boolean;
  research_only?: boolean;
  context?: {
    sessionId: string;
    userId?: string;
    previousContext?: string;
  };
}

interface DeerFlowStreamEvent {
  type: 'connection_confirmed' | 'search' | 'thought' | 'source' | 'snippet' | 'complete' | 
        'reasoning_content' | 'tool_call' | 'tool_call_result' | 'message_chunk' | 
        'plan_created' | 'plan_accepted' | 'plan_rejected' | 'error';
  data?: any;
  message?: string;
  error?: string;
  query?: string;
  source?: {
    id: string;
    title: string;
    url: string;
    type: string;
    confidence: number;
    snippet?: string;
  };
  plan?: Array<{
    id: string;
    description: string;
    status: 'pending' | 'active' | 'completed';
  }>;
  reasoning?: string;
  content?: string;
}

class DeerFlowService {
  private static instance: DeerFlowService;
  private ws: WebSocket | null = null;
  private currentSessionId: string | null = null;

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
      // Close existing connection
      this.disconnect();

      // Use the DeerFlow backend endpoint
      const wsUrl = 'wss://ai-agent-research-optivise-production.up.railway.app/stream';
      
      this.ws = new WebSocket(wsUrl);
      this.currentSessionId = request.context?.sessionId || this.generateSessionId();

      return new Promise((resolve, reject) => {
        if (!this.ws) {
          reject(new Error('Failed to create WebSocket connection'));
          return;
        }

        this.ws.onopen = () => {
          console.log('🦌 DeerFlow WebSocket connected');
          
          // Use EXACT format from backend integration guide
          const payload = {
            query: request.query,
            context: {
              sessionId: this.currentSessionId
            }
          };

          console.log('📤 Sending to DeerFlow:', JSON.stringify(payload, null, 2));
          this.ws?.send(JSON.stringify(payload));
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            onEvent(data);

            // Resolve when research is complete
            if (data.type === 'complete') {
              resolve();
            }
          } catch (error) {
            console.error('Error parsing DeerFlow message:', error);
            onEvent({
              type: 'error',
              error: 'Failed to parse response from DeerFlow service'
            });
          }
        };

        this.ws.onerror = (error) => {
          console.error('DeerFlow WebSocket error:', error);
          onEvent({
            type: 'error',
            error: 'Connection error with DeerFlow service'
          });
          reject(error);
        };

        this.ws.onclose = (event) => {
          console.log('DeerFlow WebSocket closed:', event.code, event.reason);
          if (event.code !== 1000) { // Not a normal closure
            onEvent({
              type: 'error',
              error: `Connection closed unexpectedly: ${event.reason || 'Unknown error'}`
            });
          }
        };

        // Set a timeout for the connection
        setTimeout(() => {
          if (this.ws?.readyState === WebSocket.CONNECTING) {
            this.ws?.close();
            reject(new Error('Connection timeout'));
          }
        }, 30000);
      });
    } catch (error) {
      console.error('Error starting DeerFlow research:', error);
      throw error;
    }
  }

  sendPlanFeedback(accepted: boolean, feedback?: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('No active DeerFlow connection for plan feedback');
      return;
    }

    const payload = {
      type: accepted ? 'plan_accept' : 'plan_reject',
      feedback: feedback || ''
    };

    this.ws.send(JSON.stringify(payload));
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'User disconnected');
      this.ws = null;
    }
    this.currentSessionId = null;
  }

  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private generateSessionId(): string {
    return `deerflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const deerflowService = DeerFlowService.getInstance();
export type { DeerFlowChatRequest, DeerFlowStreamEvent };