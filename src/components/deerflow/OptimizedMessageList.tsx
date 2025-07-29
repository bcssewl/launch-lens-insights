/**
 * @file OptimizedMessageList.tsx
 * @description Virtual scrolling optimized message list for large conversations
 */

import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import { VariableSizeList as List } from 'react-window';
import { DeerMessage } from '@/stores/deerFlowMessageStore';
import { MessageItem } from './MessageItem';
import { motion } from 'motion/react';

interface OptimizedMessageListProps {
  messages: DeerMessage[];
  isStreaming?: boolean;
  className?: string;
}

interface MessageItemWrapperProps {
  index: number;
  style: React.CSSProperties;
  data: {
    messages: DeerMessage[];
    isStreaming: boolean;
  };
}

// Estimated height for different message types
const MESSAGE_HEIGHT_ESTIMATES = {
  user: 80,
  assistant: 120,
  planner: 200,
  reporter: 180,
  podcast: 150
} as const;

const MessageItemWrapper: React.FC<MessageItemWrapperProps> = ({ 
  index, 
  style, 
  data: { messages, isStreaming } 
}) => {
  const message = messages[index];
  const isLastMessage = index === messages.length - 1;
  
  return (
    <div style={style}>
      <div className="px-4">
        <MessageItem 
          messageId={message.id} 
          aria-posinset={index + 1}
          aria-setsize={messages.length}
        />
        {isLastMessage && isStreaming && (
          <div className="flex items-center justify-center py-4">
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-2 w-2 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                  aria-hidden="true"
                />
              ))}
            </div>
            <span className="sr-only">Message is being generated</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Custom hook for measuring container
const useMeasure = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setDimensions({ width, height });
      }
    });

    if (ref.current) {
      resizeObserver.observe(ref.current);
      // Set initial dimensions
      const rect = ref.current.getBoundingClientRect();
      setDimensions({ width: rect.width, height: rect.height });
    }

    return () => resizeObserver.disconnect();
  }, []);

  return [ref, dimensions] as const;
};

export const OptimizedMessageList: React.FC<OptimizedMessageListProps> = ({
  messages,
  isStreaming = false,
  className = ''
}) => {
  const [containerRef, { width, height }] = useMeasure();
  const listRef = useRef<List>(null);

  // Memoized message data to prevent unnecessary re-renders
  const messageData = useMemo(() => ({
    messages,
    isStreaming
  }), [messages, isStreaming]);

  // Estimated item height based on message type
  const getItemHeight = useCallback((index: number) => {
    const message = messages[index];
    if (!message) return MESSAGE_HEIGHT_ESTIMATES.assistant;

    const agent = message.agent;
    if (agent === 'planner') return MESSAGE_HEIGHT_ESTIMATES.planner;
    if (agent === 'researcher') return MESSAGE_HEIGHT_ESTIMATES.reporter;
    if (message.role === 'user') return MESSAGE_HEIGHT_ESTIMATES.user;
    
    return MESSAGE_HEIGHT_ESTIMATES.assistant;
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (listRef.current && messages.length > 0) {
      listRef.current.scrollToItem(messages.length - 1, 'end');
    }
  }, [messages.length]);

  // For small lists, render normally to avoid virtual scrolling overhead
  if (messages.length < 50) {
    return (
      <div 
        className={`space-y-4 p-4 ${className}`}
        role="log"
        aria-live="polite"
        aria-label="Conversation messages"
      >
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <MessageItem 
              messageId={message.id}
              aria-posinset={index + 1}
              aria-setsize={messages.length}
            />
          </motion.div>
        ))}
        {isStreaming && (
          <div className="flex items-center justify-center py-4">
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-2 w-2 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                  aria-hidden="true"
                />
              ))}
            </div>
            <span className="sr-only">Message is being generated</span>
          </div>
        )}
      </div>
    );
  }

  // Virtual scrolling for large conversations
  return (
    <div 
      ref={containerRef} 
      className={`${className} h-full`}
      role="log"
      aria-live="polite"
      aria-label="Conversation messages"
    >
      {width > 0 && height > 0 && (
        <List
          ref={listRef}
          width={width}
          height={height}
          itemCount={messages.length}
          itemSize={getItemHeight}
          itemData={messageData}
          overscanCount={5}
        >
          {MessageItemWrapper}
        </List>
      )}
    </div>
  );
};