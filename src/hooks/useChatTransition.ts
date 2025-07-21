
import { useState, useCallback, useRef } from 'react';

export type ChatTransitionState = 'landing' | 'transitioning' | 'settling' | 'chatting';

export const useChatTransition = () => {
  const [transitionState, setTransitionState] = useState<ChatTransitionState>('landing');
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const settlingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startTransition = useCallback(() => {
    if (transitionState !== 'landing') return;
    
    setTransitionState('transitioning');
    
    // Clear any existing timeouts
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    if (settlingTimeoutRef.current) {
      clearTimeout(settlingTimeoutRef.current);
    }
    
    // Complete transition after 400ms
    transitionTimeoutRef.current = setTimeout(() => {
      setTransitionState('settling');
      
      // Add settling period to prevent premature resets
      settlingTimeoutRef.current = setTimeout(() => {
        setTransitionState('chatting');
      }, 100);
    }, 400);
  }, [transitionState]);

  const resetToLanding = useCallback(() => {
    // Only allow reset if we're not in transition or settling
    if (transitionState === 'transitioning' || transitionState === 'settling') {
      return;
    }
    
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    if (settlingTimeoutRef.current) {
      clearTimeout(settlingTimeoutRef.current);
    }
    setTransitionState('landing');
  }, [transitionState]);

  const cleanup = useCallback(() => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    if (settlingTimeoutRef.current) {
      clearTimeout(settlingTimeoutRef.current);
    }
  }, []);

  return {
    transitionState,
    startTransition,
    resetToLanding,
    cleanup,
    isLanding: transitionState === 'landing',
    isTransitioning: transitionState === 'transitioning',
    isSettling: transitionState === 'settling',
    isChatting: transitionState === 'chatting',
    isAnimating: transitionState === 'transitioning' || transitionState === 'settling',
  };
};
