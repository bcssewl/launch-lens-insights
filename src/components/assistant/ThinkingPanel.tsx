
/**
 * @file ThinkingPanel.tsx
 * @description Message-specific collapsible panel to display the agent's live thought process.
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronUp, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReasoning } from '@/contexts/ReasoningContext';

interface ThinkingPanelProps {
  messageId: string;
}

const ThinkingPanel: React.FC<ThinkingPanelProps> = ({ messageId }) => {
  const { getThinkingStateForMessage } = useReasoning();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const thoughtsEndRef = useRef<HTMLDivElement>(null);

  const thinkingState = getThinkingStateForMessage(messageId);
  const { phase = 'idle', thoughts = [], isThinking = false } = thinkingState || {};

  useEffect(() => {
    // Auto-scroll to the bottom of the thoughts list
    thoughtsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thoughts]);

  // Don't render if no thinking state or if idle
  if (!thinkingState || phase === 'idle') {
    return null;
  }

  return (
    <div className={cn(
      'opt-thinking-panel',
      'bg-gray-50/80 dark:bg-gray-800/40 backdrop-blur-sm',
      'border-t border-b border-border/30',
      'transition-all duration-300 ease-in-out overflow-hidden'
    )}>
      <div
        className="flex items-center justify-between p-2 cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-expanded={!isCollapsed}
      >
        <div className="flex items-center gap-2">
          <Brain className={cn('w-4 h-4 text-blue-500', isThinking && 'animate-pulse')} />
          <span className="text-xs font-medium">Agent's Thought Process</span>
        </div>
        <ChevronUp className={cn('w-4 h-4 transition-transform', isCollapsed && 'rotate-180')} />
      </div>
      {!isCollapsed && (
        <div className="p-2 border-t border-border/20 max-h-48 overflow-y-auto">
          <ul className="space-y-1">
            {thoughts.map((thought, index) => (
              <li key={index} className="opt-thought-line text-xs text-muted-foreground">
                {thought}
              </li>
            ))}
          </ul>
          <div ref={thoughtsEndRef} />
        </div>
      )}
    </div>
  );
};

export default ThinkingPanel;
