
/**
 * @file ReasoningContext.tsx
 * @description Message-specific context for managing the state of the agent's thought process.
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ThinkingState } from '@/utils/thinkingParser';

interface MessageThinkingState {
  [messageId: string]: ThinkingState;
}

interface ReasoningContextType {
  getThinkingStateForMessage: (messageId: string) => ThinkingState | null;
  setThinkingStateForMessage: (messageId: string, state: ThinkingState | null) => void;
  clearThinkingStateForMessage: (messageId: string) => void;
  clearAllThinkingStates: () => void;
}

const ReasoningContext = createContext<ReasoningContextType | undefined>(undefined);

export const ReasoningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messageThinkingStates, setMessageThinkingStates] = useState<MessageThinkingState>({});

  const getThinkingStateForMessage = useCallback((messageId: string): ThinkingState | null => {
    return messageThinkingStates[messageId] || null;
  }, [messageThinkingStates]);

  const setThinkingStateForMessage = useCallback((messageId: string, state: ThinkingState | null) => {
    console.log('🧠 Setting thinking state for message:', messageId, 'state:', state?.phase);
    setMessageThinkingStates(prev => {
      const newStates = { ...prev };
      if (state === null) {
        delete newStates[messageId];
      } else {
        newStates[messageId] = state;
      }
      return newStates;
    });
  }, []);

  const clearThinkingStateForMessage = useCallback((messageId: string) => {
    console.log('🧠 Clearing thinking state for message:', messageId);
    setMessageThinkingStates(prev => {
      const newStates = { ...prev };
      delete newStates[messageId];
      return newStates;
    });
  }, []);

  const clearAllThinkingStates = useCallback(() => {
    console.log('🧠 Clearing all thinking states');
    setMessageThinkingStates({});
  }, []);

  const value = useMemo(() => ({
    getThinkingStateForMessage,
    setThinkingStateForMessage,
    clearThinkingStateForMessage,
    clearAllThinkingStates,
  }), [getThinkingStateForMessage, setThinkingStateForMessage, clearThinkingStateForMessage, clearAllThinkingStates]);

  return (
    <ReasoningContext.Provider value={value}>
      {children}
    </ReasoningContext.Provider>
  );
};

export const useReasoning = (): ReasoningContextType => {
  const context = useContext(ReasoningContext);
  if (!context) {
    throw new Error('useReasoning must be used within a ReasoningProvider');
  }
  return context;
};
