
import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTypewriterOptions {
  speed?: number; // milliseconds per character
  enabled?: boolean;
}

export const useTypewriter = (
  targetText: string, 
  options: UseTypewriterOptions = {}
) => {
  const { speed = 8, enabled = true } = options; // Faster speed for smoother experience
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const targetTextRef = useRef(targetText);
  const currentIndexRef = useRef(0);
  const lastUpdateRef = useRef(0);
  const debounceTimeoutRef = useRef<number | null>(null);

  // Update target text reference
  useEffect(() => {
    targetTextRef.current = targetText;
  }, [targetText]);

  const typeCharacter = useCallback(() => {
    const currentTarget = targetTextRef.current;
    const currentIndex = currentIndexRef.current;
    
    if (currentIndex < currentTarget.length) {
      setDisplayedText(currentTarget.slice(0, currentIndex + 1));
      currentIndexRef.current += 1;
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
    
    // Use interval instead of recursive timeouts for smoother performance
    intervalRef.current = window.setInterval(typeCharacter, speed);
  }, [targetText, speed, enabled, typeCharacter]);

  // Enhanced effect with debouncing and smart updates
  useEffect(() => {
    if (!enabled) {
      setDisplayedText(targetText);
      setIsTyping(false);
      return;
    }

    // Clear existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;

    // If text is significantly longer or it's been a while, restart typewriter
    if (targetText.length > displayedText.length + 20 || timeSinceLastUpdate > 100) {
      // Debounce rapid updates
      debounceTimeoutRef.current = window.setTimeout(() => {
        startTypewriter();
        lastUpdateRef.current = Date.now();
      }, 10);
    } else if (targetText !== displayedText && !isTyping) {
      // For small changes, continue from current position
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
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    displayedText,
    isTyping,
    progress: targetText.length > 0 ? (displayedText.length / targetText.length) * 100 : 0
  };
};
