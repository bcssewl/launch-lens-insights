/**
 * @file ReasoningContext.tsx
 * @description Global context for managing the state of the agent's thought process.
 */

import React, { createContext, useContext, useState, useMemo } from 'react';
import type { ThinkingState } from '@/utils/thinkingParser';

interface ReasoningContextType {
  thinkingState: ThinkingState | null;
  setThinkingState: (state: ThinkingState | null) => void;
  messageId: string | null;
  setMessageId: (id: string | null) => void;
}

const ReasoningContext = createContext<ReasoningContextType | undefined>(undefined);

export const ReasoningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [thinkingState, setThinkingState] = useState<ThinkingState | null>(null);
  const [messageId, setMessageId] = useState<string | null>(null);

  const value = useMemo(() => ({
    thinkingState,
    setThinkingState,
    messageId,
    setMessageId,
  }), [thinkingState, messageId]);

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
