/**
 * ThinkingPanel - Real-time display of agent's thought process
 * Shows thinking phases with smooth animations and accessibility features
 */

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Brain, Lightbulb, Zap, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ThinkingPhase } from '@/utils/thinkingParser';
import { Progress } from '@/components/ui/progress';

interface ThinkingPanelProps {
  phase: ThinkingPhase;
  isVisible: boolean;
  className?: string;
}

export const ThinkingPanel: React.FC<ThinkingPanelProps> = ({
  phase,
  isVisible,
  className
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const thoughtsListRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef(0);

  /**
   * Get phase-specific icon and styling
   */
  const getPhaseConfig = () => {
    switch (phase.phase) {
      case 'thinking':
        return {
          icon: Brain,
          label: 'Thinking...',
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20'
        };
      case 'generating':
        return {
          icon: Lightbulb,
          label: 'Generating Response...',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/20'
        };
      case 'done':
        return {
          icon: CheckCircle,
          label: 'Complete',
          color: 'text-green-400',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/20'
        };
      default:
        return {
          icon: Zap,
          label: 'Processing...',
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/20'
        };
    }
  };

  const phaseConfig = getPhaseConfig();
  const Icon = phaseConfig.icon;

  /**
   * Handle scroll detection to pause auto-scroll
   */
  useEffect(() => {
    const thoughtsList = thoughtsListRef.current;
    if (!thoughtsList) return;

    const handleScroll = () => {
      const currentScrollTop = thoughtsList.scrollTop;
      const maxScroll = thoughtsList.scrollHeight - thoughtsList.clientHeight;
      
      // User is scrolling if not at bottom
      setIsUserScrolling(currentScrollTop < maxScroll - 10);
      lastScrollTop.current = currentScrollTop;
    };

    thoughtsList.addEventListener('scroll', handleScroll);
    return () => thoughtsList.removeEventListener('scroll', handleScroll);
  }, []);

  /**
   * Auto-scroll to latest thought when not user scrolling
   */
  useEffect(() => {
    if (!isUserScrolling && thoughtsListRef.current && phase.thoughts.length > 0) {
      const thoughtsList = thoughtsListRef.current;
      thoughtsList.scrollTo({
        top: thoughtsList.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [phase.thoughts.length, isUserScrolling]);

  if (!isVisible && phase.phase === 'idle') {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ 
            duration: 0.3,
            height: { type: "spring", stiffness: 300, damping: 30 }
          }}
          className={cn(
            "opt-thinking-panel",
            "mb-4 overflow-hidden rounded-lg border backdrop-blur-md",
            "sm:mb-4 sm:rounded-lg",
            "max-sm:mb-2 max-sm:rounded-md max-sm:mx-2",
            phaseConfig.bgColor,
            phaseConfig.borderColor,
            className
          )}
          aria-live="polite"
          aria-label="Agent thinking process"
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between p-3 cursor-pointer sm:p-3 max-sm:p-2"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: phase.phase === 'thinking' ? 360 : 0 }}
                transition={{ duration: 2, repeat: phase.phase === 'thinking' ? Infinity : 0 }}
              >
                <Icon className={cn("h-4 w-4", phaseConfig.color)} />
              </motion.div>
              <span className="opt-thinking-label text-sm font-medium text-foreground sm:text-sm max-sm:text-xs">
                {phaseConfig.label}
              </span>
              <span className="opt-thinking-count text-xs text-muted-foreground max-sm:hidden">
                ({phase.totalThoughts} thoughts)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="opt-thinking-progress w-16">
                <Progress value={phase.progress} className="h-1" />
              </div>
              {isCollapsed ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Thinking Content */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="opt-thinking-content border-t border-border/50"
              >
                <div
                  ref={thoughtsListRef}
                  className="max-h-32 overflow-y-auto p-3 space-y-2 sm:p-3 sm:space-y-2 max-sm:p-2 max-sm:space-y-1 max-sm:max-h-24"
                  style={{ scrollbarWidth: 'thin' }}
                >
                  {phase.thoughts.length === 0 ? (
                    <div className="opt-thinking-placeholder text-xs text-muted-foreground italic">
                      Analyzing your request...
                    </div>
                  ) : (
                    phase.thoughts.map((thought, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="opt-thinking-item text-xs text-foreground/80 p-2 rounded bg-background/50 border border-border/30"
                      >
                        <span className="opt-thinking-text">{thought}</span>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Progress Footer */}
                {phase.progress > 0 && (
                  <div className="opt-thinking-footer px-3 pb-3">
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{Math.round(phase.progress)}%</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ThinkingPanel;