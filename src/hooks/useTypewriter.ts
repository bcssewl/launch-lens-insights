
import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTypewriterOptions {
  speed?: number; // milliseconds per character
  enabled?: boolean;
}

// Simplified typewriter hook - now mainly used for fallback scenarios
// The main Algeon streaming uses the optimized approach in useOptimizedStreaming
export const useTypewriter = (
  targetText: string, 
  options: UseTypewriterOptions = {}
) => {
  const { speed = 50, enabled = true } = options;
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (!enabled) {
      setDisplayedText(targetText);
      setIsTyping(false);
      return;
    }

    if (targetText !== displayedText) {
      setIsTyping(true);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Simple character-by-character reveal for non-optimized scenarios
      let currentIndex = 0;
      const reveal = () => {
        if (currentIndex < targetText.length) {
          setDisplayedText(targetText.slice(0, currentIndex + 1));
          currentIndex++;
          timeoutRef.current = window.setTimeout(reveal, speed);
        } else {
          setIsTyping(false);
        }
      };
      
      reveal();
    }
  }, [targetText, speed, enabled, displayedText]);

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
