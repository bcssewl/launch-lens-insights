
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
  currentPhaseMessage: string;
  phaseStartTime: number;
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
    currentPhaseMessage: 'Thinking...',
    phaseStartTime: Date.now(),
  });

  const bufferRef = useRef<string>('');
  const displayedRef = useRef<string>('');
  const animationRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const isAnimatingRef = useRef<boolean>(false);
  const batchSizeRef = useRef<number>(1); // Characters per batch for smooth typing
  const isCompletedRef = useRef<boolean>(false); // Track completion to prevent duplicates
  const phaseIntervalRef = useRef<number | null>(null);

  // Optimized typewriter animation using RAF with precise character-per-frame calculation
  const typewriterAnimation = useCallback(() => {
    const buffer = bufferRef.current;
    const displayed = displayedRef.current;

    // Only continue if we have text to reveal
    if (buffer.length > displayed.length) {
      // Calculate characters per frame for exact 30 chars/sec at 60fps
      const TYPEWRITER_SPEED = 30; // chars/sec
      const CHARS_PER_FRAME = TYPEWRITER_SPEED / 60; // ~0.5 chars per frame at 60fps
      
      // Use Math.ceil to ensure we show at least one character every few frames
      const charsToReveal = Math.max(1, Math.ceil(CHARS_PER_FRAME));
      const newDisplayed = buffer.slice(0, displayed.length + charsToReveal);
      
      displayedRef.current = newDisplayed;
      
      // Update state with new displayed text
      setStreamingState(prev => ({
        ...prev,
        displayedText: newDisplayed,
        progress: Math.min(95, (newDisplayed.length / Math.max(buffer.length, 1)) * 100)
      }));

      // Continue animation loop
      animationRef.current = requestAnimationFrame(typewriterAnimation);
    } else {
      // Animation complete
      isAnimatingRef.current = false;
    }
  }, []);

  // Start typewriter animation when new content is buffered
  const startTypewriter = useCallback(() => {
    if (!isAnimatingRef.current && bufferRef.current.length > displayedRef.current.length) {
      console.log('🎬 Starting typewriter animation');
      isAnimatingRef.current = true;
      
      // Cancel any existing animation frame before starting a new one
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // Start the animation loop
      animationRef.current = requestAnimationFrame(typewriterAnimation);
    }
  }, [typewriterAnimation]);

  // Process incoming chunks efficiently
  const processChunk = useCallback((chunk: string) => {
    // Add chunk to buffer
    bufferRef.current += chunk;
    
    console.log(`📝 Received chunk (${chunk.length} chars), buffer now: ${bufferRef.current.length} chars`);
    
    // Update buffered text state
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

  // Update phase message
  const updatePhaseMessage = useCallback((message: string) => {
    console.log('🔄 Phase update:', message);
    setStreamingState(prev => ({
      ...prev,
      currentPhaseMessage: message,
      phaseStartTime: Date.now()
    }));
  }, []);

  // Complete streaming and show all remaining text
  const completeStreaming = useCallback(() => {
    // Prevent duplicate completion
    if (isCompletedRef.current) {
      console.log('🚫 Streaming already completed, ignoring duplicate completion');
      return;
    }
    
    console.log('✅ Completing streaming - final text length:', bufferRef.current.length);
    isCompletedRef.current = true;
    
    // Ensure all buffered text is displayed immediately
    displayedRef.current = bufferRef.current;
    
    setStreamingState(prev => ({
      ...prev,
      isStreaming: false,
      isComplete: true,
      displayedText: bufferRef.current,
      progress: 100,
      currentPhaseMessage: 'Complete'
    }));

    // Clean up animation and phase timer
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (phaseIntervalRef.current) {
      clearInterval(phaseIntervalRef.current);
      phaseIntervalRef.current = null;
    }
    isAnimatingRef.current = false;
  }, []);

  // Start streaming with clean state
  const startStreaming = useCallback(() => {
    console.log('🚀 Starting streaming with clean state');
    
    // Reset all state
    bufferRef.current = '';
    displayedRef.current = '';
    isAnimatingRef.current = false;
    isCompletedRef.current = false; // Reset completion flag
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (phaseIntervalRef.current) {
      clearInterval(phaseIntervalRef.current);
      phaseIntervalRef.current = null;
    }

    const startTime = Date.now();

    setStreamingState({
      isStreaming: true,
      displayedText: '',
      bufferedText: '',
      citations: [],
      error: null,
      isComplete: false,
      progress: 0,
      currentPhaseMessage: 'Thinking...',
      phaseStartTime: startTime,
    });

    // Set up phase message timer (every 3 minutes)
    const phaseMessages = [
      'Thinking...',           // 0-3 minutes
      'Still thinking...',     // 3-6 minutes  
      'Gathering resources...', // 6-9 minutes
      'Structuring data, almost done...' // 9-12 minutes
    ];
    
    let currentPhaseIndex = 0;
    
    phaseIntervalRef.current = window.setInterval(() => {
      currentPhaseIndex++;
      if (currentPhaseIndex < phaseMessages.length && !isCompletedRef.current) {
        updatePhaseMessage(phaseMessages[currentPhaseIndex]);
      }
    }, 180000); // 3 minutes = 180,000ms

  }, [updatePhaseMessage]);

  // Set error and cleanup
  const setError = useCallback((error: string) => {
    setStreamingState(prev => ({
      ...prev,
      isStreaming: false,
      error,
      isComplete: false,
      currentPhaseMessage: 'Error occurred'
    }));

    // Clean up animation and phase timer
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (phaseIntervalRef.current) {
      clearInterval(phaseIntervalRef.current);
      phaseIntervalRef.current = null;
    }
    isAnimatingRef.current = false;
    isCompletedRef.current = false;
  }, []);

  // Reset all streaming state - NEW METHOD
  const reset = useCallback(() => {
    console.log('🔄 Resetting streaming state completely');
    
    // Reset all refs
    bufferRef.current = '';
    displayedRef.current = '';
    isAnimatingRef.current = false;
    isCompletedRef.current = false;
    
    // Cancel any ongoing animation and phase timer
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (phaseIntervalRef.current) {
      clearInterval(phaseIntervalRef.current);
      phaseIntervalRef.current = null;
    }

    // Reset state
    setStreamingState({
      isStreaming: false,
      displayedText: '',
      bufferedText: '',
      citations: [],
      error: null,
      isComplete: false,
      progress: 0,
      currentPhaseMessage: 'Thinking...',
      phaseStartTime: Date.now(),
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (phaseIntervalRef.current) {
        clearInterval(phaseIntervalRef.current);
      }
    };
  }, []);

  return {
    streamingState,
    processChunk,
    processCitations,
    completeStreaming,
    startStreaming,
    setError,
    reset,
    updatePhaseMessage
  };
};
