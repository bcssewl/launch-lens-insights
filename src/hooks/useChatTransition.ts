
import { useState, useCallback, useRef } from 'react';

export type ChatTransitionState = 'landing' | 'transitioning' | 'chatting';

export const useChatTransition = () => {
  const [transitionState, setTransitionState] = useState<ChatTransitionState>('landing');
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startTransition = useCallback(() => {
    if (transitionState !== 'landing') return;
    
    setTransitionState('transitioning');
    
    // Clear any existing timeout
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    
    // Complete transition after 400ms
    transitionTimeoutRef.current = setTimeout(() => {
      setTransitionState('chatting');
    }, 400);
  }, [transitionState]);

  const resetToLanding = useCallback(() => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    setTransitionState('landing');
  }, []);

  return {
    transitionState,
    startTransition,
    resetToLanding,
    isLanding: transitionState === 'landing',
    isTransitioning: transitionState === 'transitioning',
    isChatting: transitionState === 'chatting',
  };
};
