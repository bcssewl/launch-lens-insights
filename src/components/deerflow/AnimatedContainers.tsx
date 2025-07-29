/**
 * @file AnimatedContainers.tsx
 * @description Sophisticated animation containers with custom easing and spring physics
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

// Custom easing curves for professional animations
export const easings = {
  professional: "easeOut" as const,
  elastic: "easeInOut" as const,
  smooth: "easeOut" as const,
  snappy: "easeInOut" as const,
};

// Research Panel Animation Container
interface ResearchPanelContainerProps {
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
}

export const ResearchPanelContainer = React.forwardRef<HTMLDivElement, ResearchPanelContainerProps>(({
  isOpen,
  children,
  className
}, ref) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          ref={ref}
          className={cn(
            "w-[min(max(calc((100vw-538px)*0.75),575px),960px)] pb-4",
            className
          )}
          initial={shouldReduceMotion ? { opacity: 0 } : { 
            opacity: 0, 
            x: 100, 
            scale: 0.95,
            rotateY: -5
          }}
          animate={shouldReduceMotion ? { opacity: 1 } : { 
            opacity: 1, 
            x: 0, 
            scale: 1,
            rotateY: 0
          }}
          exit={shouldReduceMotion ? { opacity: 0 } : { 
            opacity: 0, 
            x: 50, 
            scale: 0.98,
            rotateY: 2
          }}
          transition={shouldReduceMotion ? { duration: 0.2 } : {
            duration: 0.4,
            ease: easings.professional,
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.25 },
            scale: { duration: 0.3, delay: 0.05 },
            rotateY: { duration: 0.35, delay: 0.1 }
          }}
          style={{ perspective: 1000 }}
          layout
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
});

ResearchPanelContainer.displayName = "ResearchPanelContainer";

// Message Container with Staggered Animation
interface MessageContainerProps {
  children: React.ReactNode;
  index: number;
  className?: string;
  isStreaming?: boolean;
}

export const MessageContainer = React.forwardRef<HTMLDivElement, MessageContainerProps>(({ 
  children, 
  index, 
  className,
  isStreaming = false
}, ref) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={shouldReduceMotion ? { opacity: 0 } : { 
        opacity: 0, 
        y: 24, 
        scale: 0.98,
        rotateX: -3
      }}
      animate={shouldReduceMotion ? { opacity: 1 } : { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        rotateX: 0
      }}
      exit={shouldReduceMotion ? { opacity: 0 } : { 
        opacity: 0, 
        y: -12, 
        scale: 0.99
      }}
      transition={shouldReduceMotion ? { duration: 0.2 } : {
        duration: 0.5,
        ease: easings.elastic,
        delay: Math.min(index * 0.05, 0.3), // Cap delay at 300ms
        y: { type: "spring", stiffness: 400, damping: 25 },
        scale: { duration: 0.25, delay: Math.min(index * 0.05 + 0.1, 0.4) },
        rotateX: { duration: 0.3, delay: Math.min(index * 0.05 + 0.05, 0.35) }
      }}
      style={{ perspective: 1000 }}
      layout="position"
      layoutId={`message-${index}`}
    >
      {children}
    </motion.div>
  );
});

MessageContainer.displayName = "MessageContainer";

// Plan Card Animation Container
interface PlanCardContainerProps {
  children: React.ReactNode;
  isStreaming: boolean;
  className?: string;
}

export const PlanCardContainer = React.forwardRef<HTMLDivElement, PlanCardContainerProps>(({ 
  children, 
  isStreaming, 
  className 
}, ref) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={shouldReduceMotion ? { opacity: 0 } : { 
        opacity: 0, 
        y: 32, 
        rotateX: -8,
        scale: 0.95
      }}
      animate={shouldReduceMotion ? { opacity: 1 } : { 
        opacity: 1, 
        y: 0, 
        rotateX: 0,
        scale: 1
      }}
      transition={shouldReduceMotion ? { duration: 0.3 } : {
        duration: 0.7,
        ease: easings.elastic,
        y: { type: "spring", stiffness: 300, damping: 30 },
        rotateX: { duration: 0.5, delay: 0.15 },
        scale: { duration: 0.4, delay: 0.1 }
      }}
      style={{ perspective: 1200 }}
      whileHover={shouldReduceMotion ? {} : {
        y: -2,
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
    >
      {children}
    </motion.div>
  );
});

PlanCardContainer.displayName = "PlanCardContainer";

// Plan Step Animation
interface PlanStepProps {
  children: React.ReactNode;
  index: number;
  className?: string;
}

export const PlanStep: React.FC<PlanStepProps> = ({ children, index, className }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn("relative", className)}
      initial={shouldReduceMotion ? { opacity: 0 } : { 
        opacity: 0, 
        x: -20, 
        scale: 0.95,
        rotateY: -10
      }}
      animate={shouldReduceMotion ? { opacity: 1 } : { 
        opacity: 1, 
        x: 0, 
        scale: 1,
        rotateY: 0
      }}
      transition={shouldReduceMotion ? { duration: 0.2, delay: index * 0.05 } : {
        duration: 0.5,
        delay: index * 0.1 + 0.4, // Delay after card appears
        ease: easings.smooth,
        x: { type: "spring", stiffness: 300, damping: 25 },
        scale: { duration: 0.3 },
        rotateY: { duration: 0.4 }
      }}
      style={{ perspective: 800 }}
    >
      {/* Step Number Animation */}
      <motion.div
        className="absolute left-[-2rem] top-3 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground font-medium"
        initial={shouldReduceMotion ? { opacity: 0 } : { 
          scale: 0, 
          rotate: -180,
          opacity: 0
        }}
        animate={shouldReduceMotion ? { opacity: 1 } : { 
          scale: 1, 
          rotate: 0,
          opacity: 1
        }}
        transition={shouldReduceMotion ? { duration: 0.2, delay: index * 0.05 + 0.1 } : {
          duration: 0.4,
          delay: index * 0.1 + 0.6,
          type: "spring",
          stiffness: 500,
          damping: 20
        }}
      >
        {index + 1}
      </motion.div>
      {children}
    </motion.div>
  );
};

// Tool Call Result Animation
interface ToolCallResultProps {
  children: React.ReactNode;
  isVisible: boolean;
  className?: string;
}

export const ToolCallResult: React.FC<ToolCallResultProps> = ({ 
  children, 
  isVisible, 
  className 
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={className}
          initial={shouldReduceMotion ? { opacity: 0 } : { 
            opacity: 0, 
            height: 0, 
            y: -10,
            scale: 0.98
          }}
          animate={shouldReduceMotion ? { opacity: 1 } : { 
            opacity: 1, 
            height: "auto", 
            y: 0,
            scale: 1
          }}
          exit={shouldReduceMotion ? { opacity: 0 } : { 
            opacity: 0, 
            height: 0, 
            y: -5,
            scale: 0.99
          }}
          transition={shouldReduceMotion ? { duration: 0.2 } : {
            duration: 0.5,
            ease: easings.smooth,
            height: { duration: 0.4 },
            opacity: { duration: 0.3, delay: 0.1 },
            y: { type: "spring", stiffness: 400, damping: 30 },
            scale: { duration: 0.25, delay: 0.05 }
          }}
          style={{ overflow: 'hidden' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Search Result Grid Item
interface SearchResultItemProps {
  children: React.ReactNode;
  index: number;
  className?: string;
  onHover?: () => void;
}

export const SearchResultItem: React.FC<SearchResultItemProps> = ({ 
  children, 
  index, 
  className,
  onHover
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? { opacity: 0 } : { 
        opacity: 0, 
        y: 20, 
        scale: 0.8,
        rotateY: -15
      }}
      animate={shouldReduceMotion ? { opacity: 1 } : { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        rotateY: 0
      }}
      whileHover={shouldReduceMotion ? {} : { 
        scale: 1.05, 
        y: -2,
        rotateY: 2,
        transition: { duration: 0.2 }
      }}
      onHoverStart={onHover}
      transition={shouldReduceMotion ? { duration: 0.2, delay: index * 0.03 } : {
        duration: 0.4,
        delay: index * 0.05,
        ease: easings.smooth,
        y: { type: "spring", stiffness: 400, damping: 25 },
        scale: { type: "spring", stiffness: 500, damping: 30 },
        rotateY: { duration: 0.4 }
      }}
      style={{ perspective: 1000 }}
    >
      {children}
    </motion.div>
  );
};

// Chat Container Layout Animation
interface ChatContainerProps {
  children: React.ReactNode;
  isResearchOpen: boolean;
  className?: string;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ 
  children, 
  isResearchOpen, 
  className 
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn("flex flex-col shrink-0", className)}
      animate={shouldReduceMotion ? {} : {
        width: isResearchOpen ? "538px" : "768px",
        x: isResearchOpen ? 0 : "calc((100vw - 768px) / 2)"
      }}
      transition={shouldReduceMotion ? { duration: 0.1 } : {
        duration: 0.4,
        ease: easings.professional,
        width: { type: "spring", stiffness: 300, damping: 30 }
      }}
      layout
    >
      {children}
    </motion.div>
  );
};

// Enhanced Button Animation
interface AnimatedButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({ 
  children, 
  className, 
  onClick,
  disabled = false,
  variant = 'default'
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        variant === 'default' && "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === 'outline' && "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        variant === 'ghost' && "hover:bg-accent hover:text-accent-foreground",
        "px-4 py-2",
        !shouldReduceMotion && "hover:shadow-lg hover:shadow-primary/25",
        className
      )}
      onClick={onClick}
      disabled={disabled}
      whileHover={shouldReduceMotion || disabled ? {} : { 
        scale: 1.02, 
        y: -1,
        transition: { type: "spring", stiffness: 500, damping: 30 }
      }}
      whileTap={shouldReduceMotion || disabled ? {} : { 
        scale: 0.98, 
        y: 0,
        transition: { duration: 0.1 }
      }}
      initial={shouldReduceMotion ? {} : { scale: 1 }}
      animate={shouldReduceMotion ? {} : { scale: 1 }}
    >
      {children}
    </motion.button>
  );
};