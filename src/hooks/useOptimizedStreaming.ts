
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
  const wsRef = useRef<WebSocket | null>(null);
  const isAnimatingRef = useRef<boolean>(false);

  // Optimized typewriter animation using RAF
  const typewriterAnimation = useCallback(() => {
    const now = Date.now();
    const buffer = bufferRef.current;
    const displayed = displayedRef.current;
    
    // Only update every 50ms for smooth but efficient animation
    if (now - lastUpdateRef.current < 50) {
      if (buffer.length > displayed.length) {
        animationRef.current = requestAnimationFrame(typewriterAnimation);
      }
      return;
    }

    if (buffer.length > displayed.length) {
      // Reveal 8-12 characters per frame for smooth animation
      const charsToReveal = Math.min(10, buffer.length - displayed.length);
      const newDisplayed = buffer.slice(0, displayed.length + charsToReveal);
      
      displayedRef.current = newDisplayed;
      lastUpdateRef.current = now;

      // Batch state update for better performance
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

  // Process incoming 450-character chunks
  const processChunk = useCallback((chunk: string) => {
    // Add chunk directly to buffer
    bufferRef.current += chunk;
    
    // Update buffered text state (less frequently)
    setStreamingState(prev => ({
      ...prev,
      bufferedText: bufferRef.current
    }));

    // Start typewriter animation if not already running
    startTypewriter();
  }, [startTypewriter]);

  // Process citations
  const processCitations = useCallback((citations: Array<{ name: string; url: string; type?: string }>) => {
    setStreamingState(prev => ({
      ...prev,
      citations
    }));
  }, []);

  // Complete streaming
  const completeStreaming = useCallback(() => {
    // Ensure all buffered text is displayed
    displayedRef.current = bufferRef.current;
    
    setStreamingState(prev => ({
      ...prev,
      isStreaming: false,
      isComplete: true,
      displayedText: bufferRef.current,
      progress: 100
    }));

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    isAnimatingRef.current = false;
  }, []);

  // Start streaming
  const startStreaming = useCallback(() => {
    // Reset state
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

  // Set error
  const setError = useCallback((error: string) => {
    setStreamingState(prev => ({
      ...prev,
      isStreaming: false,
      error,
      isComplete: false
    }));

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
