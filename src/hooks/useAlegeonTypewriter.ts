
import { useState, useEffect, useRef, useCallback } from 'react';

interface UseAlegeonTypewriterOptions {
  speed?: number; // characters per second
  enabled?: boolean;
  onComplete?: () => void;
}

interface TypewriterState {
  displayedText: string;
  isTyping: boolean;
  progress: number;
}

export const useAlegeonTypewriter = (
  targetText: string,
  options: UseAlegeonTypewriterOptions = {}
) => {
  const { speed = 25, enabled = true, onComplete } = options;
  
  const [state, setState] = useState<TypewriterState>({
    displayedText: '',
    isTyping: false,
    progress: 0
  });
  
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const currentIndexRef = useRef<number>(0);
  const targetTextRef = useRef<string>('');
  
  // Calculate characters per frame (60fps)
  const charsPerFrame = speed / 60;
  
  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);
  
  const startTypewriter = useCallback(() => {
    if (!enabled || !targetText) return;
    
    cleanup();
    
    const animate = (timestamp: number) => {
      if (!lastUpdateTimeRef.current) {
        lastUpdateTimeRef.current = timestamp;
      }
      
      const deltaTime = timestamp - lastUpdateTimeRef.current;
      const shouldUpdate = deltaTime >= (1000 / 60); // 60fps
      
      if (shouldUpdate) {
        const charsToAdd = Math.floor(charsPerFrame);
        const newIndex = Math.min(
          currentIndexRef.current + Math.max(1, charsToAdd),
          targetText.length
        );
        
        const newDisplayedText = targetText.substring(0, newIndex);
        const progress = targetText.length > 0 ? (newIndex / targetText.length) * 100 : 0;
        
        setState(prev => ({
          ...prev,
          displayedText: newDisplayedText,
          progress,
          isTyping: newIndex < targetText.length
        }));
        
        currentIndexRef.current = newIndex;
        lastUpdateTimeRef.current = timestamp;
        
        if (newIndex >= targetText.length) {
          setState(prev => ({ ...prev, isTyping: false }));
          onComplete?.();
          return;
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    setState(prev => ({ ...prev, isTyping: true }));
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [targetText, enabled, speed, charsPerFrame, cleanup, onComplete]);
  
  const fastForward = useCallback(() => {
    cleanup();
    setState(prev => ({
      ...prev,
      displayedText: targetText,
      isTyping: false,
      progress: 100
    }));
    currentIndexRef.current = targetText.length;
    onComplete?.();
  }, [targetText, cleanup, onComplete]);
  
  // Start typewriter when target text changes
  useEffect(() => {
    if (targetText !== targetTextRef.current) {
      targetTextRef.current = targetText;
      currentIndexRef.current = 0;
      lastUpdateTimeRef.current = 0;
      
      if (targetText) {
        startTypewriter();
      } else {
        setState({ displayedText: '', isTyping: false, progress: 0 });
      }
    }
  }, [targetText, startTypewriter]);
  
  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);
  
  return {
    ...state,
    fastForward
  };
};
