import { useEffect, useRef, useState, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMessageIds } from '@/hooks/useOptimizedMessages';
import { useDeerFlowMessageStore, DeerMessage } from '@/stores/deerFlowMessageStore';
import { MessageItem } from './MessageItem';
import { ResearchCard } from './ResearchCard';
import { PlanCard } from './PlanCard';
import { ConversationStarter } from './ConversationStarter';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';

/**
 * Loading animation component
 */
const LoadingAnimation = () => (
  <div className="flex items-center justify-center py-8">
    <div className="flex space-x-2">
      <motion.div 
        className="w-2 h-2 bg-primary rounded-full"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
      />
      <motion.div 
        className="w-2 h-2 bg-primary rounded-full"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
      />
      <motion.div 
        className="w-2 h-2 bg-primary rounded-full"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
      />
    </div>
  </div>
);

/**
 * Message entry animation component with staggered animations
 */
const MessageEntryAnimation = ({ children, index }: { children: React.ReactNode; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{
        duration: 0.4,
        ease: "easeOut",
        delay: index * 0.1 // Stagger animation
      }}
      layout
    >
      {children}
    </motion.div>
  );
};

/**
 * Helper function to determine if a message should start a research session display
 */
const isResearchStarter = (message: DeerMessage, researchIds: string[], researchPlanIds: Map<string, string>): boolean => {
  // Check if this message is a plan that has an associated research session
  for (const [researchId, planId] of researchPlanIds.entries()) {
    if (planId === message.id && researchIds.includes(researchId)) {
      return true;
    }
  }
  return false;
};

interface MessageListProps {
  onSendMessage?: (message: string) => void;
}

export const MessageList = ({ onSendMessage }: MessageListProps) => {
  // Store access
  const messageIds = useMessageIds();
  const { 
    getMessage, 
    openResearchPanel, 
    startResearch,
    researchIds,
    researchPlanIds,
    ongoingResearchId,
    isResponding,
    getResearchTitle
  } = useDeerFlowMessageStore();
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Defensive coding: ensure messageIds is always an array
  const safeMessageIds = Array.isArray(messageIds) ? messageIds : [];

  // Enhanced message filtering for main chat display
  const visibleMessages = useMemo(() => {
    return safeMessageIds
      .map(id => getMessage(id))
      .filter((message): message is DeerMessage => {
        if (!message) return false;
        
        // Original DeerFlow logic: show main chat types + startOfResearch
        return (
          message.role === 'user' ||
          message.agent === 'coordinator' ||
          message.agent === 'planner' ||
          message.agent === 'podcast' ||
          researchIds.includes(message.id) // ADD THIS: startOfResearch logic
        );
      });
  }, [safeMessageIds, getMessage, researchIds]); // ADD researchIds dependency

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        const scrollToBottom = () => {
          scrollElement.scrollTop = scrollElement.scrollHeight;
        };
        
        // Smooth scroll with slight delay for animations
        setTimeout(scrollToBottom, 100);
      }
    }
  }, [visibleMessages.length]);

  const handleSendMessage = (message: string) => {
    if (onSendMessage) {
      onSendMessage(message);
    }
  };

  const handleStartResearch = (planId: string) => {
    // Create research session manually from planner
    const researchId = startResearch(planId); // Now works with planner ID
    if (researchId) {
      openResearchPanel(researchId, 'activities');
    }
  };

  // Show conversation starter if no messages
  if (visibleMessages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <ConversationStarter onSendMessage={handleSendMessage} />
        </motion.div>
      </div>
    );
  }

  return (
    <ScrollArea 
      ref={scrollAreaRef} 
      className="h-full"
      // Accessibility improvements
      role="log"
      aria-label="Chat messages"
      aria-live="polite"
    >
      <div className={cn(
        // Enhanced spacing and responsive design
        "w-full max-w-none space-y-6 sm:space-y-8",
        "py-4 sm:py-6 lg:py-8",
        "px-4 sm:px-6 lg:px-8"
      )}>
        <AnimatePresence mode="popLayout">
          {/* Render visible messages */}
          {visibleMessages.map((message, index) => {
            const isPlanner = message.agent === 'planner';
            const isStartOfResearch = researchIds.includes(message.id); // First researcher message
            
            return (
              <MessageEntryAnimation key={message.id} index={index}>
                <ErrorBoundary
                  fallback={
                    <motion.div 
                      className="animate-pulse bg-destructive/10 border border-destructive/20 rounded-lg h-16 p-4 flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="text-destructive text-sm">Message failed to load</span>
                    </motion.div>
                  }
                >
                  {isPlanner ? (
                    <PlanCard 
                      message={message}
                      onStartResearch={handleStartResearch}
                      isExecuting={ongoingResearchId !== null}
                    />
                  ) : isStartOfResearch ? (
                    <ResearchCard 
                      researchId={message.id} // Use the researcher message ID
                      title={getResearchTitle(message.id)}
                    />
                  ) : (
                    <MessageItem messageId={message.id} />
                  )}
                </ErrorBoundary>
              </MessageEntryAnimation>
            );
          })}

          {/* Loading indicator when responding */}
          {isResponding && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex justify-center"
            >
              <div className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg",
                "bg-muted/50 border border-border/50",
                "backdrop-blur-sm"
              )}>
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  AI is thinking...
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
};