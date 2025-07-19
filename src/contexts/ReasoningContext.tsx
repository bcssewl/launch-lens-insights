/**
 * ReasoningContext - Global state management for thinking/reasoning phases
 * Provides thinking state to any component without prop drilling
 */

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { ThinkingParser, ThinkingPhase } from '@/utils/thinkingParser';
import { generateTelemetryHash } from '@/utils/telemetry';

interface ReasoningContextType {
  currentPhase: ThinkingPhase;
  isThinkingVisible: boolean;
  processThinkingChunk: (chunk: string, sessionId?: string) => void;
  showThinking: () => void;
  hideThinking: () => void;
  forceCompleteThinking: () => void;
  resetThinking: () => void;
}

const ReasoningContext = createContext<ReasoningContextType | undefined>(undefined);

export const useReasoningContext = () => {
  const context = useContext(ReasoningContext);
  if (!context) {
    throw new Error('useReasoningContext must be used within a ReasoningProvider');
  }
  return context;
};

interface ReasoningProviderProps {
  children: React.ReactNode;
}

export const ReasoningProvider: React.FC<ReasoningProviderProps> = ({ children }) => {
  const [currentPhase, setCurrentPhase] = useState<ThinkingPhase>({
    phase: 'idle',
    progress: 0,
    thoughts: [],
    totalThoughts: 0
  });
  const [isThinkingVisible, setIsThinkingVisible] = useState(false);
  
  const parserRef = useRef<ThinkingParser>(new ThinkingParser());
  const timeoutRef = useRef<number | null>(null);
  const telemetryRef = useRef<{
    sessionId?: string;
    startTime: number;
    totalThoughts: number;
  }>({ startTime: 0, totalThoughts: 0 });

  /**
   * Process thinking chunk and update phase
   */
  const processThinkingChunk = useCallback((chunk: string, sessionId?: string) => {
    const parser = parserRef.current;
    const newPhase = parser.processChunk(chunk);
    
    setCurrentPhase(newPhase);
    
    // Start thinking session if first thought detected
    if (newPhase.phase === 'thinking' && !isThinkingVisible) {
      setIsThinkingVisible(true);
      telemetryRef.current = {
        sessionId,
        startTime: Date.now(),
        totalThoughts: 0
      };
      
      // Set 15s timeout only for thinking phase
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => {
        if (currentPhase.phase === 'thinking') {
          forceCompleteThinking();
        }
      }, 15000); // 15 seconds
    }
    
    // Auto-collapse when generating phase completes
    if (newPhase.phase === 'done' && isThinkingVisible) {
      // Delay to allow final thoughts to be visible
      setTimeout(() => {
        setIsThinkingVisible(false);
        logTelemetry();
      }, 2000);
    }
  }, [isThinkingVisible, currentPhase.phase]);

  /**
   * Force complete thinking (for timeout or manual trigger)
   */
  const forceCompleteThinking = useCallback(() => {
    const parser = parserRef.current;
    const completedPhase = parser.forceComplete();
    setCurrentPhase(completedPhase);
    
    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Hide panel after completion
    setTimeout(() => {
      setIsThinkingVisible(false);
      logTelemetry();
    }, 1500);
  }, []);

  /**
   * Show thinking panel manually
   */
  const showThinking = useCallback(() => {
    setIsThinkingVisible(true);
  }, []);

  /**
   * Hide thinking panel manually
   */
  const hideThinking = useCallback(() => {
    setIsThinkingVisible(false);
  }, []);

  /**
   * Reset all thinking state
   */
  const resetThinking = useCallback(() => {
    parserRef.current.reset();
    setCurrentPhase({
      phase: 'idle',
      progress: 0,
      thoughts: [],
      totalThoughts: 0
    });
    setIsThinkingVisible(false);
    
    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Reset telemetry
    telemetryRef.current = { startTime: 0, totalThoughts: 0 };
  }, []);

  /**
   * Log privacy-safe telemetry
   */
  const logTelemetry = useCallback(async () => {
    const { sessionId, startTime, totalThoughts } = telemetryRef.current;
    const duration = Date.now() - startTime;
    
    if (startTime > 0 && sessionId) {
      try {
        // Generate privacy-safe hash
        const sessionHash = await generateTelemetryHash(sessionId + currentPhase.totalThoughts);
        
        console.log('📊 Thinking telemetry:', {
          sessionHash,
          duration,
          totalThoughts: currentPhase.totalThoughts,
          phase: currentPhase.phase
        });
        
        // TODO: Send to analytics endpoint if needed
      } catch (error) {
        console.warn('Failed to log thinking telemetry:', error);
      }
    }
  }, [currentPhase]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const value: ReasoningContextType = {
    currentPhase,
    isThinkingVisible,
    processThinkingChunk,
    showThinking,
    hideThinking,
    forceCompleteThinking,
    resetThinking
  };

  return (
    <ReasoningContext.Provider value={value}>
      {children}
    </ReasoningContext.Provider>
  );
};