import { useEffect, useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMessageIds } from '@/hooks/useOptimizedMessages';
import { useDeerFlowMessageStore } from '@/stores/deerFlowMessageStore';
import { MessageItem } from './MessageItem';
import { ResearchCard } from './ResearchCard';
import { ConversationStarter } from './ConversationStarter';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { cn } from '@/lib/utils';

/**
 * Message entry animation component using platform's timing
 */
const MessageEntryAnimation = ({ children, index }: { children: React.ReactNode; index: number }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Stagger animation using platform's timing
    const delay = index * 100; // Platform's stagger delay
    setTimeout(() => setIsVisible(true), delay);
  }, [index]);
  
  return (
    <div className={cn(
      // Use platform's animation classes
      "transition-all duration-300 ease-out", // Standard transition
      !isVisible && "opacity-0 transform translate-y-4", // Entry state
      isVisible && "opacity-100 transform translate-y-0" // Final state
    )}>
      {children}
    </div>
  );
};

/**
 * Helper function to identify messages that start a research session
 */
const isStartOfResearch = (messageId: string, getMessage: (id: string) => any) => {
  const message = getMessage(messageId);
  if (!message) return false;
  
  // Research starts when we see first researcher activity or tool call
  return message.agent === 'researcher' && message.toolCalls && message.toolCalls.length > 0;
};

interface MessageListProps {
  onSendMessage?: (message: string) => void;
}

export const MessageList = ({ onSendMessage }: MessageListProps) => {
  // Use individual message subscriptions following original DeerFlow pattern
  const messageIds = useMessageIds();
  const getMessage = useDeerFlowMessageStore(state => state.getMessage);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Defensive coding: ensure messageIds is always an array
  const safeMessageIds = Array.isArray(messageIds) ? messageIds : [];

  // Filter messages for main chat display (matching original DeerFlow logic)
  const visibleMessageIds = safeMessageIds.filter(messageId => {
    const message = getMessage(messageId);
    if (!message) return false;
    
    // Only show these in main chat
    return (
      message.role === 'user' ||
      message.agent === 'coordinator' ||
      message.agent === 'planner' ||
      message.agent === 'podcast' ||
      isStartOfResearch(messageId, getMessage)
    );
  });

  // Auto-scroll to bottom when new messages arrive - use stable dependencies
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [safeMessageIds.length]);

  const handleSendMessage = (message: string) => {
    if (onSendMessage) {
      onSendMessage(message);
    }
  };

  if (messageIds.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <ConversationStarter onSendMessage={handleSendMessage} />
      </div>
    );
  }

  return (
    <ScrollArea ref={scrollAreaRef} className="h-full">
      <div className={cn(
        // Use existing content container styling
        "w-full max-w-none", // Override prose max-width
        "space-y-6 sm:space-y-8", // Platform's message spacing
        "py-4 sm:py-6 lg:py-8", // Platform's container padding
        "px-4 sm:px-6 lg:px-8" // Platform's horizontal padding
      )}>
        {visibleMessageIds.map((messageId, index) => {
          const message = getMessage(messageId);
          const isResearchStart = isStartOfResearch(messageId, getMessage);
          
          return (
            <MessageEntryAnimation key={messageId} index={index}>
              <ErrorBoundary
                fallback={
                  <div className="animate-pulse bg-muted/20 rounded-lg h-16 p-4 flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">Message failed to load</span>
                  </div>
                }
              >
                {isResearchStart ? (
                  <ResearchCard 
                    researchId={messageId}
                    title={message?.content}
                  />
                ) : (
                  <MessageItem messageId={messageId} />
                )}
              </ErrorBoundary>
            </MessageEntryAnimation>
          );
        })}
      </div>
    </ScrollArea>
  );
};