import { useAlegeonStreamingV2, AlegeonStreamingStateV2 } from './useAlegeonStreamingV2';
import { useDeerStreaming, DeerStreamingState, DeerThoughtStep } from './useDeerStreaming';

export interface UnifiedStreamingState extends AlegeonStreamingStateV2 {
  isWaitingForFeedback?: boolean;
  thoughtSteps?: DeerThoughtStep[];
}

export const useUnifiedStreaming = (modelId: string | null | undefined, messageId: string | null) => {
  const alegeon = useAlegeonStreamingV2(messageId);
  const deer = useDeerStreaming();

  if (modelId === 'deer') {
    const { streamingState: deerState, startStreaming: startDeerStreaming, stopStreaming: stopDeerStreaming, sendFeedback: sendDeerFeedback } = deer;
    
    const normalizedState: UnifiedStreamingState = {
      isStreaming: deerState.isStreaming,
      currentPhase: deerState.isStreaming ? 'generating' : 'idle',
      displayedText: deerState.finalAnswer,
      bufferedText: '',
      citations: deerState.sources.map(s => ({ url: s.url, title: s.title || s.url, description: s.content })),
      error: deerState.error,
      isComplete: !deerState.isStreaming && deerState.finalAnswer !== '',
      progress: deerState.isStreaming ? 50 : 100, // Simple progress for now
      progressDetail: deerState.currentReasoning,
      hasContent: deerState.finalAnswer !== '',
      isTyping: deerState.isStreaming,
      typewriterProgress: 0,
      metadata: {},
      isWaitingForFeedback: deerState.isWaitingForFeedback,
      thoughtSteps: deerState.thoughtSteps,
    };

    return {
      streamingState: normalizedState,
      startStreaming: startDeerStreaming,
      stopStreaming: stopDeerStreaming,
      sendFeedback: sendDeerFeedback,
      fastForward: () => {}, // No fastForward in deer hook
      resetState: deer.resetState,
    };
  }

  return { ...alegeon, sendFeedback: (feedback: string) => {} }; // Add dummy sendFeedback for Algeon
};
