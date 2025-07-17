
import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTypewriterOptions {
  speed?: number; // milliseconds per character
  enabled?: boolean;
}

export const useTypewriter = (
  targetText: string, 
  options: UseTypewriterOptions = {}
) => {
  const { speed = 3, enabled = true } = options; // Very fast for smooth experience
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const targetTextRef = useRef(targetText);
  const currentIndexRef = useRef(0);
  const lastUpdateRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // Update target text reference
  useEffect(() => {
    targetTextRef.current = targetText;
  }, [targetText]);

  const typeCharacter = useCallback(() => {
    const currentTarget = targetTextRef.current;
    const currentIndex = currentIndexRef.current;
    
    if (currentIndex < currentTarget.length) {
      // Type multiple characters at once for very smooth experience
      const charsToAdd = Math.min(3, currentTarget.length - currentIndex);
      setDisplayedText(currentTarget.slice(0, currentIndex + charsToAdd));
      currentIndexRef.current += charsToAdd;
    } else {
      setIsTyping(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, []);

  const startTypewriter = useCallback(() => {
    if (!enabled || !targetText) return;
    
    setIsTyping(true);
    currentIndexRef.current = 0;
    setDisplayedText('');
    
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Use faster interval for smooth streaming
    intervalRef.current = window.setInterval(typeCharacter, speed);
  }, [targetText, speed, enabled, typeCharacter]);

  // Enhanced effect with better performance
  useEffect(() => {
    if (!enabled) {
      setDisplayedText(targetText);
      setIsTyping(false);
      return;
    }

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;

    // If text changed significantly or it's been a while, restart
    if (targetText.length > displayedText.length + 50 || timeSinceLastUpdate > 100) {
      // Use RAF for better performance
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      rafRef.current = requestAnimationFrame(() => {
        startTypewriter();
        lastUpdateRef.current = Date.now();
      });
    } else if (targetText !== displayedText && !isTyping && targetText.length > displayedText.length) {
      // Continue from current position for small changes
      currentIndexRef.current = displayedText.length;
      setIsTyping(true);
      intervalRef.current = window.setInterval(typeCharacter, speed);
    }
  }, [targetText, enabled, displayedText.length, isTyping, startTypewriter, typeCharacter, speed]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return {
    displayedText,
    isTyping,
    progress: targetText.length > 0 ? (displayedText.length / targetText.length) * 100 : 0
  };
};
