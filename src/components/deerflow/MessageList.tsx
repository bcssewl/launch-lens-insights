import { useEffect, useRef, useState, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMessageIds } from '@/hooks/useOptimizedMessages';
import { useDeerFlowMessageStore, DeerMessage } from '@/stores/deerFlowMessageStore';
import { MessageItem } from './MessageItem';
import { ResearchCard } from './ResearchCard';
import { PlanCard } from './PlanCard';
import { ConversationStarter } from './ConversationStarter';
import { PodcastCard } from './PodcastCard';
import { MessageContainer } from './AnimatedContainers';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { useEnhancedDeerStreaming } from '@/hooks/useEnhancedDeerStreaming';

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
  const { startDeerFlowStreaming } = useEnhancedDeerStreaming();
  
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

  // Enhanced message filtering for main chat display with debug logging
  const visibleMessages = useMemo(() => {
    console.log('🔍 DEBUG: Processing message IDs:', safeMessageIds);
    console.log('🔍 DEBUG: ResearchIds:', researchIds);
    console.log('🔍 DEBUG: ResearchPlanIds:', Array.from(researchPlanIds.entries()));
    
    const allMessages = safeMessageIds
      .map(id => {
        const message = getMessage(id);
        console.log('🔍 DEBUG: Message', id, ':', {
          role: message?.role,
          agent: message?.agent,
          content: message?.content?.slice(0, 100),
          isStreaming: message?.isStreaming
        });
        return message;
      })
      .filter((message): message is DeerMessage => {
        if (!message) {
          console.log('🔍 DEBUG: Filtered out null message');
          return false;
        }
        
        // Log all messages and their filtering decisions
        const shouldShow = (
          message.role === 'user' ||
          message.role === 'assistant' ||
          message.agent === 'coordinator' ||
          message.agent === 'planner' ||
          message.agent === 'podcast'
        );
        
        if (!shouldShow) {
          console.log('🔍 DEBUG: Filtered out message:', message.id, 'Role:', message.role, 'Agent:', message.agent);
        } else {
          console.log('🔍 DEBUG: Including message:', message.id, 'Role:', message.role, 'Agent:', message.agent);
        }
        
        return shouldShow;
      });
    
    console.log('🔍 DEBUG: Final visible messages count:', allMessages.length);
    return allMessages;
  }, [safeMessageIds, getMessage, researchIds, researchPlanIds]);

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

  const handleSendMessage = (message: string, options?: { interruptFeedback?: string }) => {
    if (onSendMessage) {
      onSendMessage(message);
    } else {
      // Fallback: use streaming directly
      startDeerFlowStreaming(message, {
        // Include interrupt feedback for plan acceptance
        ...(options?.interruptFeedback && { /* add to options */ })
      });
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
            
            // Check if this planner message has an associated research session
            const hasResearchSession = Array.from(researchPlanIds.entries())
              .some(([_, planId]) => planId === message.id);
            
            console.log('🔄 Rendering message:', message.id, 'Agent:', message.agent, 'Has research:', hasResearchSession);
            
            return (
              <MessageContainer key={message.id} index={index}>
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
                      onSendMessage={handleSendMessage}
                      isExecuting={ongoingResearchId !== null}
                    />
                  ) : message.agent === 'podcast' ? (
                    <PodcastCard message={message} />
                  ) : (
                    <MessageItem messageId={message.id} />
                  )}
                </ErrorBoundary>
              </MessageContainer>
            );
          })}

          {/* Show ResearchCard for active research sessions */}
          {researchIds.map((researchId, index) => {
            const researchTitle = getResearchTitle(researchId);
            return (
              <MessageContainer key={`research-${researchId}`} index={visibleMessages.length + index}>
                <ResearchCard 
                  researchId={researchId}
                  title={researchTitle}
                />
              </MessageContainer>
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