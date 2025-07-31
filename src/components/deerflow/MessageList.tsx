import React, { useEffect, useRef, useState, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMessageIds } from '@/hooks/useOptimizedMessages';
import { 
  useDeerFlowMessageStore, 
  DeerMessage, 
  useLastInterruptMessage, 
  useLastFeedbackMessageId 
} from '@/stores/deerFlowMessageStore';
import { MessageItem } from './MessageItem';
import { ResearchCard } from './ResearchCard';
import { PlanCard } from './PlanCard';
import { ConversationStarter } from './ConversationStarter';
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
 * Message entry animation component with staggered animations
 */
const MessageEntryAnimation = React.forwardRef<HTMLDivElement, { children: React.ReactNode; index: number }>(
  ({ children, index }, ref) => {
    return (
      <motion.div
        ref={ref}
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
  }
);

MessageEntryAnimation.displayName = "MessageEntryAnimation";

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
  onSendMessage?: (message: string, options?: { interruptFeedback?: string }) => void;
  onFeedback?: (feedback: { option: { value: string; text: string } }) => void;
}

export const MessageList = ({ onSendMessage, onFeedback }: MessageListProps) => {
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
  
  // Interrupt message tracking (matching DeerFlow)
  const interruptMessage = useLastInterruptMessage();
  const waitingForFeedbackMessageId = useLastFeedbackMessageId();
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Defensive coding: ensure messageIds is always an array
  const safeMessageIds = Array.isArray(messageIds) ? messageIds : [];

  // Enhanced message filtering for main chat display
  const visibleMessages = useMemo(() => {
    // Debug logging - reduced to prevent excessive console spam
    if (process.env.NODE_ENV === 'development' && Math.random() < 0.1) { // Only log 10% of filter operations
      console.log('🔍 MessageList filtering messages:', {
        totalMessages: safeMessageIds.length,
        researchIds: researchIds,
        ongoingResearchId
      });
    }
    
    const filtered = safeMessageIds
      .map(id => getMessage(id))
      .filter((message): message is DeerMessage => {
        if (!message) return false;
        
        const shouldShow = (
          message.role === 'user' ||
          message.agent === 'coordinator' ||
          message.agent === 'planner' ||
          message.agent === 'podcast' ||
          researchIds.includes(message.id) // startOfResearch logic
        );
        
        // Excessive logging removed - only log on rare occasions for debugging
        if (process.env.NODE_ENV === 'development' && Math.random() < 0.01) {
          console.log('🔍 Message filtering:', {
            messageId: message.id,
            agent: message.agent,
            role: message.role,
            isResearchId: researchIds.includes(message.id),
            shouldShow
          });
        }
        
        return shouldShow;
      });
      
    // Debug logging - reduced frequency
    if (process.env.NODE_ENV === 'development' && Math.random() < 0.1) {
      console.log('✅ MessageList visible messages:', filtered.length);
    }
    return filtered;
  }, [safeMessageIds, getMessage, researchIds, ongoingResearchId]);

  // Check if there are any streaming planner messages
  const hasStreamingPlanner = useMemo(() => {
    return visibleMessages.some(msg => msg.agent === 'planner' && msg.isStreaming);
  }, [visibleMessages]);

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
      onSendMessage(message, options);
    } else {
      // Fallback: use streaming directly
      startDeerFlowStreaming(message, {
        // Include interrupt feedback for plan acceptance
        ...(options?.interruptFeedback && { interruptFeedback: options.interruptFeedback })
      });
    }
  };

  const handleFeedback = (feedback: { option: { text: string; value: string } }) => {
    console.log('Plan feedback received:', feedback);
    // TODO: Implement feedback handling logic similar to DeerFlow
    if (handleSendMessage) {
      handleSendMessage("", {
        interruptFeedback: feedback.option.value
      });
    }
  };

  const handleStartResearch = (planId: string) => {
    // NOTE: Research session creation is now handled by streaming response
    // This function is kept for legacy compatibility but does minimal work
    console.log('📋 Plan research requested for:', planId);
    // Research state will be managed by the streaming response events
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
                      messageId={message.id}
                      interruptMessage={interruptMessage}
                      onSendMessage={handleSendMessage}
                      waitForFeedback={waitingForFeedbackMessageId === message.id}
                      onFeedback={onFeedback}
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

          {/* Loading indicator when responding - only show when no planner is streaming */}
          {isResponding && (ongoingResearchId === null) && !hasStreamingPlanner && (
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