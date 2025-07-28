/**
 * @file ThoughtBlock.tsx
 * @description Smart thinking block component with auto-collapse and dynamic theming
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import MarkdownRenderer from '@/components/assistant/MarkdownRenderer';

interface ThoughtBlockProps {
  reasoningContent: string;
  reasoningContentChunks?: string[];
  hasMainContent: boolean;
  isStreaming: boolean;
  agent?: string;
  className?: string;
}

export const ThoughtBlock: React.FC<ThoughtBlockProps> = ({
  reasoningContent,
  reasoningContentChunks = [],
  hasMainContent,
  isStreaming,
  agent = 'assistant',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasAutoCollapsed, setHasAutoCollapsed] = useState(false);

  // Determine if we're in thinking phase
  const isThinking = reasoningContent && !hasMainContent;
  
  // Smart auto-expand/collapse logic
  useEffect(() => {
    if (isThinking && !isOpen && !hasAutoCollapsed) {
      // Auto-expand during thinking phase
      setIsOpen(true);
    } else if (hasMainContent && !hasAutoCollapsed) {
      // Auto-collapse when main content starts
      setIsOpen(false);
      setHasAutoCollapsed(true);
    }
  }, [isThinking, hasMainContent, isOpen, hasAutoCollapsed]);

  // Combine all reasoning content for display
  const fullReasoningContent = useMemo(() => {
    if (reasoningContentChunks.length > 0) {
      return reasoningContentChunks.join('');
    }
    return reasoningContent;
  }, [reasoningContent, reasoningContentChunks]);

  // Don't render if no reasoning content
  if (!fullReasoningContent || fullReasoningContent.trim() === '') {
    return null;
  }

  // Dynamic styling based on thinking state
  const cardClasses = isThinking
    ? 'border-primary/40 bg-primary/5 shadow-sm'  // Primary theme during thinking
    : 'border-border bg-card';  // Default theme when done

  const iconClasses = isThinking
    ? 'text-primary'  // Primary color during thinking
    : 'text-muted-foreground';  // Muted when done

  const textClasses = isThinking
    ? 'text-primary font-medium'  // Primary color during thinking
    : 'text-muted-foreground opacity-80';  // Muted when done

  const getThoughtTitle = () => {
    if (agent === 'planner') {
      return isThinking ? 'Planning your research...' : 'Research planning process';
    } else if (agent === 'reporter') {
      return isThinking ? 'Analyzing findings...' : 'Analysis process';
    }
    return isThinking ? 'Deep thinking...' : 'Thought process';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`mb-4 ${className}`}
    >
      <Card className={`transition-all duration-300 ${cardClasses}`}>
        <CardContent className="px-6 py-4">
          {/* Header with toggle */}
          <Button
            variant="ghost"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full justify-between p-0 h-auto hover:bg-transparent"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Brain 
                  className={`h-[18px] w-[18px] transition-colors duration-300 ${iconClasses}`} 
                />
                {isThinking && isStreaming && (
                  <motion.div
                    className="absolute inset-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <Loader2 className="h-[18px] w-[18px] text-primary/60" />
                  </motion.div>
                )}
              </div>
              <span className={`text-sm transition-colors duration-300 ${textClasses}`}>
                {getThoughtTitle()}
              </span>
            </div>
            
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className={`h-4 w-4 transition-colors duration-300 ${iconClasses}`} />
            </motion.div>
          </Button>

          {/* Collapsible content */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-3">
                  {/* Thinking content */}
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <MarkdownRenderer content={fullReasoningContent} />
                  </div>

                  {/* Live streaming indicator */}
                  {isThinking && isStreaming && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 text-xs text-primary/70 pt-2 border-t border-primary/20"
                    >
                      <div className="flex gap-1">
                        <motion.div
                          className="w-1 h-1 bg-primary rounded-full"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-1 h-1 bg-primary rounded-full"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-1 h-1 bg-primary rounded-full"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                      <span>Thinking in progress...</span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};