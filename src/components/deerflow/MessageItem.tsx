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
  messageId: string;
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

export const MessageItem = React.memo(({ messageId }: { messageId: string }) => {
  // Use individual message subscription following original DeerFlow pattern
  const message = useMessage(messageId);
  const { openResearchPanel } = useResearchPanel();
  
  // Defensive coding: Handle loading state with skeleton
  if (!message) {
    return (
      <div className="animate-pulse bg-muted/20 rounded-lg h-16 p-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-muted/40 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-muted/40 rounded w-1/4" />
          <div className="h-3 bg-muted/40 rounded w-3/4" />
        </div>
      </div>
    );
  }
  
  // Defensive coding: ensure agent display has required properties
  const agentDisplay = getAgentDisplay(message.agent, message.role);
  const IconComponent = agentDisplay?.icon || Bot;
  
  // Handle click for research panel
  const handleClick = () => {
    if (message.agent === 'planner' || message.agent === 'researcher') {
      openResearchPanel(message.id);
    }
  };

  return (
    <div 
      className={cn(
        // Use existing card styling
        "rounded-lg border border-border",
        "bg-card text-card-foreground",
        "shadow-sm hover:shadow-md",
        "transition-all duration-300 ease-out",
        
        // Reduced padding for more compact messages
        "p-2 sm:p-3",
        
        // Streaming animations
        message.isStreaming && [
          "border-blue-500/30 shadow-blue-500/20",
          "shadow-lg animate-pulse"
        ],
        
        // Agent-specific styling using platform's color system
        message.role === 'user' && "ml-8 bg-primary/5 border-primary/20",
        message.role === 'assistant' && "mr-8",
        agentDisplay.bgColor && agentDisplay.bgColor,
        agentDisplay.borderColor && agentDisplay.borderColor,
        
        // Make clickable for research agents
        (message.agent === 'planner' || message.agent === 'researcher') && 
          "cursor-pointer hover:bg-opacity-80",
          
        // Slide-in animation for streaming content
        "animate-fade-in"
      )}
      onClick={handleClick}
    >
      {/* Message Header */}
      <div className="flex items-center gap-3 mb-2">
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
            {message.isStreaming && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-xs text-blue-600 font-medium">Streaming...</span>
              </div>
            )}
          </div>
          <time className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString()}
          </time>
        </div>
      </div>

      {/* Message Content */}
      <div className={cn(
        "transition-all duration-300 ease-out",
        message.isStreaming && "animate-slide-in-left"
      )}>
        <MessageContent 
          content={message.content} 
          agent={message.agent}
          toolCalls={message.toolCalls}
        />
      </div>
    </div>
  );
});