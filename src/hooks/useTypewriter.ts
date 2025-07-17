
import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTypewriterOptions {
  speed?: number; // milliseconds per character
  enabled?: boolean;
}

export const useTypewriter = (
  targetText: string, 
  options: UseTypewriterOptions = {}
) => {
  const { speed = 20, enabled = true } = options;
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const targetTextRef = useRef(targetText);
  const currentIndexRef = useRef(0);

  // Update target text reference
  useEffect(() => {
    targetTextRef.current = targetText;
  }, [targetText]);

  const startTypewriter = useCallback(() => {
    if (!enabled || !targetText) return;
    
    setIsTyping(true);
    currentIndexRef.current = 0;
    setDisplayedText('');
    
    const typeCharacter = () => {
      const currentTarget = targetTextRef.current;
      const currentIndex = currentIndexRef.current;
      
      if (currentIndex < currentTarget.length) {
        setDisplayedText(currentTarget.slice(0, currentIndex + 1));
        currentIndexRef.current += 1;
        
        timeoutRef.current = window.setTimeout(typeCharacter, speed);
      } else {
        setIsTyping(false);
      }
    };
    
    typeCharacter();
  }, [targetText, speed, enabled]);

  // Restart typewriter when target text changes significantly
  useEffect(() => {
    if (!enabled) {
      setDisplayedText(targetText);
      setIsTyping(false);
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // If text is significantly longer, restart typewriter
    if (targetText.length > displayedText.length + 50) {
      startTypewriter();
    } else if (targetText !== displayedText && !isTyping) {
      // For small changes, just update directly
      setDisplayedText(targetText);
    }
  }, [targetText, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    displayedText,
    isTyping,
    progress: targetText.length > 0 ? (displayedText.length / targetText.length) * 100 : 0
  };
};
