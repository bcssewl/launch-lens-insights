import { useState, useRef, useCallback, useEffect } from 'react';
import { deerflowService, DeerFlowStreamEvent, DeerFlowChatRequest } from '@/services/deerflowService';

export interface DeerThoughtStep {
  id: string;
  type: 'tool_call' | 'reasoning' | 'search' | 'analysis';
  content: string;
  timestamp: Date;
  metadata?: any;
}

export interface DeerSource {
  id: string;
  url: string;
  title: string;
  type: string;
  confidence: number;
  content?: string;
  snippet?: string;
  domain?: string;
  timestamp: Date;
}

export interface DeerStreamingState {
  isStreaming: boolean;
  thoughtSteps: DeerThoughtStep[];
  currentReasoning: string;
  finalAnswer: string;
  finalReport: string;
  sources: DeerSource[];
  currentPlan: DeerPlan | null;
  searchQueries: string[];
  error: string | null;
  currentPhase: 'planning' | 'searching' | 'analyzing' | 'synthesizing' | 'complete' | 'idle' | 'thinking';
  overallProgress: number;
  researchMode: 'academic' | 'popular_science' | 'news' | 'social_media';
}

export interface DeerPlan {
  id: string;
  steps: Array<{
    id: string;
    description: string;
    status: 'pending' | 'active' | 'completed';
  }>;
  isActive: boolean;
  needsApproval: boolean;
}

const INITIAL_STATE: DeerStreamingState = {
  isStreaming: false,
  thoughtSteps: [],
  currentReasoning: '',
  finalAnswer: '',
  finalReport: '',
  sources: [],
  currentPlan: null,
  searchQueries: [],
  error: null,
  currentPhase: 'idle',
  overallProgress: 0,
  researchMode: 'academic'
};

export const useDeerStreaming = () => {
  const [streamingState, setStreamingState] = useState<DeerStreamingState>(INITIAL_STATE);
  const eventSourceRef = useRef<EventSource | null>(null);
  const promiseResolveRef = useRef<((result: any) => void) | null>(null);
  const promiseRejectRef = useRef<((error: any) => void) | null>(null);

  const cleanup = useCallback(() => {
    // No EventSource to clean up in new implementation
    console.log('🧹 Cleaning up Deer streaming connection');
  }, []);

  const resetState = useCallback(() => {
    console.log('🔄 Resetting Deer streaming state');
    cleanup();
    setStreamingState(INITIAL_STATE);
    promiseResolveRef.current = null;
    promiseRejectRef.current = null;
  }, [cleanup]);

  const startStreaming = useCallback((question: string, config?: Partial<DeerFlowChatRequest>): Promise<any> => {
    console.log('🦌 Starting DeerFlow streaming for question:', question);
    
    return new Promise(async (resolve, reject) => {
      // Store promise handlers
      promiseResolveRef.current = resolve;
      promiseRejectRef.current = reject;

      // Reset state
      setStreamingState({
        ...INITIAL_STATE,
        isStreaming: true,
        currentPhase: 'planning'
      });

      try {
        // Build DeerFlow request with dynamic configuration
        const request: DeerFlowChatRequest = {
          messages: [{ role: 'user', content: question }],
          resources: config?.resources || [],
          debug: config?.debug ?? false,
          thread_id: config?.thread_id || `deer_${Date.now()}`,
          max_plan_iterations: config?.max_plan_iterations || 1,
          max_step_num: config?.max_step_num || 3,
          max_search_results: config?.max_search_results || 3,
          auto_accepted_plan: config?.auto_accepted_plan ?? false,
          mcp_settings: config?.mcp_settings || {},
          enable_background_investigation: config?.enable_background_investigation ?? true,
          report_style: config?.report_style || 'academic',
          enable_deep_thinking: config?.enable_deep_thinking ?? false,
          ...config
        };

        // Use DeerFlow service with correct endpoint
        await deerflowService.startResearch(request, handleDeerFlowEvent);

        // Success - let event handler finish the process
      } catch (error) {
        console.error('❌ Failed to start DeerFlow streaming:', error);
        setStreamingState(prev => ({
          ...prev,
          isStreaming: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          currentPhase: 'idle'
        }));
        
        if (promiseRejectRef.current) {
          promiseRejectRef.current(error);
        }
      }
    });
  }, []);

  const handleDeerFlowEvent = useCallback((event: DeerFlowStreamEvent) => {
    console.log('🦌 REAL DeerFlow Event Received:');
    console.log('  Type:', event.type);
    console.log('  Full Event:', JSON.stringify(event, null, 2));
    console.log('  Available Keys:', Object.keys(event));

    switch (event.type) {
      case 'message':
        setStreamingState(prev => ({
          ...prev,
          finalAnswer: prev.finalAnswer + (event.content || ''),
          finalReport: prev.finalReport + (event.content || ''),
          currentPhase: 'analyzing'
        }));
        break;

      case 'thinking':
        setStreamingState(prev => ({
          ...prev,
          currentReasoning: prev.currentReasoning + (event.content || ''),
          thoughtSteps: [...prev.thoughtSteps, {
            id: Date.now().toString(),
            type: 'reasoning',
            content: event.content || '',
            timestamp: new Date()
          }],
          currentPhase: 'thinking'
        }));
        break;

      case 'planning':
        setStreamingState(prev => ({
          ...prev,
          currentPhase: 'planning'
        }));
        break;

      case 'searching':
        setStreamingState(prev => ({
          ...prev,
          currentPhase: 'searching'
        }));
        break;

      case 'analyzing':
        setStreamingState(prev => ({
          ...prev,
          currentPhase: 'analyzing'
        }));
        break;

      case 'complete':
        setStreamingState(prev => {
          const finalState = {
            ...prev,
            isStreaming: false,
            currentPhase: 'complete' as const
          };
          
          if (promiseResolveRef.current) {
            const result = {
              thoughtSteps: finalState.thoughtSteps,
              reasoning: finalState.currentReasoning,
              finalAnswer: finalState.finalAnswer || 'Research completed.',
              sources: finalState.sources,
              plan: finalState.currentPlan
            };
            promiseResolveRef.current(result);
          }
          
          return finalState;
        });
        break;

      case 'error':
        setStreamingState(prev => ({
          ...prev,
          isStreaming: false,
          error: event.error || 'Unknown error occurred',
          currentPhase: 'idle'
        }));
        
        if (promiseRejectRef.current) {
          promiseRejectRef.current(new Error(event.error || 'Unknown error'));
        }
        break;

      default:
        console.log('🔄 Unhandled DeerFlow event:', event.type);
        break;
    }
  }, []);

  const stopStreaming = useCallback(() => {
    console.log('⏹️ Manually stopping Deer streaming');
    setStreamingState(prev => ({
      ...prev,
      isStreaming: false,
      currentPhase: 'idle'
    }));
    cleanup();
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Component unmounting, cleaning up Deer streaming');
      cleanup();
    };
  }, [cleanup]);

  const sendPlanFeedback = useCallback((accepted: boolean, feedback?: string) => {
    console.log(`📝 Plan feedback: ${accepted ? 'accepted' : 'rejected'}`, feedback);
    // Implementation would send feedback to the backend
  }, []);

  return {
    streamingState,
    startStreaming,
    stopStreaming,
    resetState,
    sendPlanFeedback
  };
};