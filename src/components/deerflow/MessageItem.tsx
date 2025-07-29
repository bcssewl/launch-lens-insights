/**
 * @file MessageItem.tsx (Updated)
 * @description Individual message component with platform's card design and simplified styling
 */

import { DeerMessage } from '@/stores/deerFlowMessageStore';
import { useMessage, useResearchPanel } from '@/hooks/useOptimizedMessages';
import { MessageContent } from './MessageContent';
import { cn } from '@/lib/utils';
import { User, Bot, Brain, Search, FileText, Lightbulb, MessageSquare } from 'lucide-react';
import React from 'react';

interface MessageItemProps {
  message?: DeerMessage;
  messageId?: string;
}

/**
 * Get agent icon and styling based on message agent
 */
const getAgentDisplay = (agent?: string, role?: string) => {
  if (role === 'user') {
    return {
      icon: User,
      name: 'You',
      color: 'text-primary',
      bgColor: 'bg-primary/5',
      borderColor: 'border-primary/20'
    };
  }

  switch (agent) {
    case 'planner':
      return {
        icon: Brain,
        name: 'Planner',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50/50 dark:bg-blue-950/20',
        borderColor: 'border-l-4 border-l-blue-500'
      };
    case 'researcher':
      return {
        icon: Search,
        name: 'Researcher',
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50/50 dark:bg-emerald-950/20',
        borderColor: 'border-l-4 border-l-emerald-500'
      };
    case 'coder':
      return {
        icon: Lightbulb,
        name: 'Coder',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50/50 dark:bg-purple-950/20',
        borderColor: 'border-l-4 border-l-purple-500'
      };
    case 'reporter':
      return {
        icon: FileText,
        name: 'Reporter',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50/50 dark:bg-orange-950/20',
        borderColor: 'border-l-4 border-l-orange-500'
      };
    case 'coordinator':
      return {
        icon: MessageSquare,
        name: 'Coordinator',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50/50 dark:bg-indigo-950/20',
        borderColor: 'border-l-4 border-l-indigo-500'
      };
    default:
      return {
        icon: Bot,
        name: 'Assistant',
        color: 'text-muted-foreground',
        bgColor: 'bg-muted/20',
        borderColor: 'border-muted/40'
      };
  }
};

export const MessageItem = React.memo(({ message, messageId }: MessageItemProps) => {
  // Use hook for efficient message updates if messageId provided
  const hookMessage = useMessage(messageId || '');
  const { openResearchPanel } = useResearchPanel();
  
  // Use either prop message or hook message
  const currentMessage = message || hookMessage;
  
  if (!currentMessage) return null;
  
  const agentDisplay = getAgentDisplay(currentMessage.metadata?.agent, currentMessage.role);
  const IconComponent = agentDisplay.icon;
  
  // Handle click for research panel
  const handleClick = () => {
    if (currentMessage.metadata?.agent === 'planner' || currentMessage.metadata?.agent === 'researcher') {
      openResearchPanel(currentMessage.id);
    }
  };

  return (
    <div 
      className={cn(
        // Use existing card styling
        "rounded-lg border border-border",
        "bg-card text-card-foreground",
        "shadow-sm hover:shadow-md",
        "transition-shadow duration-200",
        
        // Apply platform's padding scale
        "p-4 sm:p-6",
        
        // Agent-specific styling using platform's color system
        currentMessage.role === 'user' && "ml-8 bg-primary/5 border-primary/20",
        currentMessage.role === 'assistant' && "mr-8",
        agentDisplay.bgColor && agentDisplay.bgColor,
        agentDisplay.borderColor && agentDisplay.borderColor,
        
        // Make clickable for research agents
        (currentMessage.metadata?.agent === 'planner' || currentMessage.metadata?.agent === 'researcher') && 
          "cursor-pointer hover:bg-opacity-80"
      )}
      onClick={handleClick}
    >
      {/* Message Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full",
          "bg-background border border-border",
          agentDisplay.color
        )}>
          <IconComponent className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={cn("font-medium text-sm", agentDisplay.color)}>
              {agentDisplay.name}
            </span>
            {currentMessage.isStreaming && (
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-current rounded-full animate-pulse" />
                <div className="w-1 h-1 bg-current rounded-full animate-pulse [animation-delay:0.2s]" />
                <div className="w-1 h-1 bg-current rounded-full animate-pulse [animation-delay:0.4s]" />
              </div>
            )}
          </div>
          <time className="text-xs text-muted-foreground">
            {currentMessage.timestamp.toLocaleTimeString()}
          </time>
        </div>
      </div>

      {/* Message Content */}
      <MessageContent 
        content={currentMessage.content} 
        agent={currentMessage.metadata?.agent}
        toolCalls={currentMessage.toolCalls}
      />
    </div>
  );
});