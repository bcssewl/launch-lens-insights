import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ThinkingState } from '../utils/thinkingParser';

interface ReasoningContextType {
  thinkingState: ThinkingState;
  updateThinkingState: (state: Partial<ThinkingState>) => void;
  resetThinking: () => void;
  // SSR-safe telemetry logging
  logTelemetry: (data: any) => void;
}

const initialState: ThinkingState = {
  phase: 'idle',
  thoughts: [],
  finalContent: '',
  progress: 0,
  thinkingNestLevel: 0
};

const ReasoningContext = createContext<ReasoningContextType | undefined>(undefined);

export function ReasoningProvider({ children }: { children: ReactNode }) {
  const [thinkingState, setThinkingState] = useState<ThinkingState>(initialState);

  const updateThinkingState = (updates: Partial<ThinkingState>) => {
    setThinkingState(prev => ({ ...prev, ...updates }));
  };

  const resetThinking = () => {
    setThinkingState(initialState);
  };

  // SSR-safe telemetry logging
  const logTelemetry = (data: any) => {
    // Guard window usage for SSR compatibility
    if (typeof window !== 'undefined' && window.console) {
      console.log('[Reasoning Telemetry]', data);
    }
  };

  return (
    <ReasoningContext.Provider value={{
      thinkingState,
      updateThinkingState,
      resetThinking,
      logTelemetry
    }}>
      {children}
    </ReasoningContext.Provider>
  );
}

export function useReasoning() {
  const context = useContext(ReasoningContext);
  if (context === undefined) {
    throw new Error('useReasoning must be used within a ReasoningProvider');
  }
  return context;
}