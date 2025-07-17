
import { useState, useCallback, useRef, useEffect } from 'react';

interface OptimizedStreamingState {
  isStreaming: boolean;
  displayedText: string;
  bufferedText: string;
  citations: Array<{
    name: string;
    url: string;
    type?: string;
  }>;
  error: string | null;
  isComplete: boolean;
  progress: number;
}

export const useOptimizedStreaming = () => {
  const [streamingState, setStreamingState] = useState<OptimizedStreamingState>({
    isStreaming: false,
    displayedText: '',
    bufferedText: '',
    citations: [],
    error: null,
    isComplete: false,
    progress: 0,
  });

  const bufferRef = useRef<string>('');
  const displayedRef = useRef<string>('');
  const animationRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const isAnimatingRef = useRef<boolean>(false);
  const batchSizeRef = useRef<number>(8); // Characters per batch

  // Optimized typewriter animation using RAF with batching
  const typewriterAnimation = useCallback(() => {
    const now = Date.now();
    const buffer = bufferRef.current;
    const displayed = displayedRef.current;
    
    // Target: 25-30 chars/sec with batching every 5-10 chars
    // Update every ~300ms with 8 chars = ~27 chars/sec
    if (now - lastUpdateRef.current < 300) {
      if (buffer.length > displayed.length) {
        animationRef.current = requestAnimationFrame(typewriterAnimation);
      }
      return;
    }

    if (buffer.length > displayed.length) {
      // Reveal batch of characters (8 chars for smooth 27 chars/sec)
      const charsToReveal = Math.min(batchSizeRef.current, buffer.length - displayed.length);
      const newDisplayed = buffer.slice(0, displayed.length + charsToReveal);
      
      displayedRef.current = newDisplayed;
      lastUpdateRef.current = now;

      // Batch state update for better performance - only update every batch
      setStreamingState(prev => ({
        ...prev,
        displayedText: newDisplayed,
        progress: Math.min(95, (newDisplayed.length / Math.max(buffer.length, 1)) * 100)
      }));

      // Continue animation
      animationRef.current = requestAnimationFrame(typewriterAnimation);
    } else {
      // Animation complete
      isAnimatingRef.current = false;
    }
  }, []);

  // Start typewriter animation when new content is buffered
  const startTypewriter = useCallback(() => {
    if (!isAnimatingRef.current && bufferRef.current.length > displayedRef.current.length) {
      isAnimatingRef.current = true;
      animationRef.current = requestAnimationFrame(typewriterAnimation);
    }
  }, [typewriterAnimation]);

  // Process incoming 450-character chunks efficiently
  const processChunk = useCallback((chunk: string) => {
    // Add entire 450-char chunk to buffer
    bufferRef.current += chunk;
    
    // Update buffered text state only when we receive chunks (not per character)
    setStreamingState(prev => ({
      ...prev,
      bufferedText: bufferRef.current
    }));

    // Start typewriter animation if not already running
    startTypewriter();
  }, [startTypewriter]);

  // Process citations (batched, not per character)
  const processCitations = useCallback((citations: Array<{ name: string; url: string; type?: string }>) => {
    setStreamingState(prev => ({
      ...prev,
      citations
    }));
  }, []);

  // Complete streaming and show all remaining text
  const completeStreaming = useCallback(() => {
    // Ensure all buffered text is displayed immediately
    displayedRef.current = bufferRef.current;
    
    setStreamingState(prev => ({
      ...prev,
      isStreaming: false,
      isComplete: true,
      displayedText: bufferRef.current,
      progress: 100
    }));

    // Clean up animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    isAnimatingRef.current = false;
  }, []);

  // Start streaming with clean state
  const startStreaming = useCallback(() => {
    // Reset all state
    bufferRef.current = '';
    displayedRef.current = '';
    isAnimatingRef.current = false;
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    setStreamingState({
      isStreaming: true,
      displayedText: '',
      bufferedText: '',
      citations: [],
      error: null,
      isComplete: false,
      progress: 0,
    });
  }, []);

  // Set error and cleanup
  const setError = useCallback((error: string) => {
    setStreamingState(prev => ({
      ...prev,
      isStreaming: false,
      error,
      isComplete: false
    }));

    // Clean up animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    isAnimatingRef.current = false;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    streamingState,
    processChunk,
    processCitations,
    completeStreaming,
    startStreaming,
    setError
  };
};
