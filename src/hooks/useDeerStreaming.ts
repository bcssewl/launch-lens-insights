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
  currentPhase: 'planning' | 'searching' | 'analyzing' | 'synthesizing' | 'complete' | 'idle';
  overallProgress: number;
  researchMode: 'academic' | 'business' | 'technical' | 'general';
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
  researchMode: 'general'
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
        // Use DeerFlow service with WebSocket
        await deerflowService.startResearch({
          query: question,
          research_mode: config?.research_mode || 'general',
          max_plan_iterations: config?.max_plan_iterations || 3,
          max_step_num: config?.max_step_num || 10,
          auto_accept_plan: config?.auto_accept_plan ?? true,
          thinking_on: config?.thinking_on ?? true,
          research_only: config?.research_only ?? false,
          context: {
            sessionId: `deer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ...config?.context
          }
        }, handleDeerFlowEvent);

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
    console.log('📨 DeerFlow event:', event.type, event);

    switch (event.type) {
      case 'connection_confirmed':
        setStreamingState(prev => ({
          ...prev,
          currentPhase: 'planning'
        }));
        break;

      case 'plan_created':
        if (event.plan) {
          setStreamingState(prev => ({
            ...prev,
            currentPlan: {
              id: Date.now().toString(),
              steps: event.plan || [],
              isActive: true,
              needsApproval: !prev.currentPlan?.isActive
            },
            currentPhase: 'planning'
          }));
        }
        break;

      case 'plan_accepted':
        setStreamingState(prev => ({
          ...prev,
          currentPhase: 'searching'
        }));
        break;

      case 'search':
        if (event.query) {
          setStreamingState(prev => ({
            ...prev,
            searchQueries: [...prev.searchQueries, event.query!],
            currentPhase: 'searching'
          }));
        }
        break;

      case 'source':
        if (event.source) {
          setStreamingState(prev => ({
            ...prev,
            sources: [...prev.sources, {
              ...event.source!,
              timestamp: new Date()
            }]
          }));
        }
        break;

      case 'reasoning_content':
        setStreamingState(prev => ({
          ...prev,
          currentReasoning: prev.currentReasoning + (event.reasoning || ''),
          thoughtSteps: [...prev.thoughtSteps, {
            id: Date.now().toString(),
            type: 'reasoning',
            content: event.reasoning || '',
            timestamp: new Date()
          }],
          currentPhase: 'analyzing'
        }));
        break;

      case 'tool_call':
        setStreamingState(prev => ({
          ...prev,
          thoughtSteps: [...prev.thoughtSteps, {
            id: event.data?.id || Date.now().toString(),
            type: 'tool_call',
            content: `Using tool: ${event.data?.function?.name || 'unknown'}`,
            timestamp: new Date(),
            metadata: event.data
          }],
          currentPhase: 'analyzing'
        }));
        break;

      case 'tool_call_result':
        setStreamingState(prev => ({
          ...prev,
          thoughtSteps: [...prev.thoughtSteps, {
            id: event.data?.tool_call_id || Date.now().toString(),
            type: 'analysis',
            content: `Tool result: ${event.data?.result || 'completed'}`,
            timestamp: new Date(),
            metadata: event.data
          }]
        }));
        break;

      case 'message_chunk':
        setStreamingState(prev => ({
          ...prev,
          finalAnswer: prev.finalAnswer + (event.content || ''),
          finalReport: prev.finalReport + (event.content || ''),
          currentPhase: 'synthesizing'
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
    deerflowService.disconnect();
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