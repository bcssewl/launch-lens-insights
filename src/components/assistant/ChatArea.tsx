import React from 'react';
import { cn } from '@/lib/utils';
import ChatMessage, { type ChatMessageData } from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import ChatEmptyState from './ChatEmptyState';
import type { StratixStreamingState } from '@/types/stratixStreaming';
import type { AlegeonStreamingState } from '@/hooks/useAlegeonStreaming';

interface StreamingUpdate {
  type: 'search' | 'source' | 'snippet' | 'thought' | 'complete';
  message: string;
  timestamp: number;
  data?: any;
}

interface ChatAreaProps {
  messages: ChatMessageData[];
  isTyping: boolean;
  viewportRef: React.RefObject<HTMLDivElement>;
  onSendMessage: (text: string, attachments?: any[], modelOverride?: string, researchType?: string) => void;
  selectedModel: string;
  onOpenCanvas?: (messageId: string, content: string) => void;
  onCloseCanvas?: () => void;
  onCanvasDownload?: () => void;
  onCanvasPrint?: () => void;
  streamingState?: {
    isStreaming: boolean;
    updates: StreamingUpdate[];
    sources: Array<{
      name: string;
      url: string;
      type?: string;
      confidence?: number;
    }>;
    progress: {
      phase: string;
      progress: number;
    };
  };
  stratixStreamingState?: StratixStreamingState;
  alegeonStreamingState?: AlegeonStreamingState;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isTyping,
  viewportRef,
  onSendMessage,
  selectedModel,
  onOpenCanvas,
  onCloseCanvas,
  onCanvasDownload,
  onCanvasPrint,
  streamingState,
  stratixStreamingState,
  alegeonStreamingState
}) => {
  const displayMessages = messages.filter(msg => msg.id !== 'initial');

  // Enhanced debug logging
  console.log('🎯 ChatArea: Rendering with streaming states:', {
    stratixStreaming: stratixStreamingState?.isStreaming,
    alegeonStreaming: alegeonStreamingState?.isStreaming,
    messagesCount: displayMessages.length,
    isTyping
  });

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Messages Container - Scrollable */}
      <div 
        ref={viewportRef}
        className="flex-1 overflow-y-auto px-6 pb-6 pt-4 space-y-6 scroll-smooth"
        style={{ scrollBehavior: 'smooth' }}
      >
        {displayMessages.length === 0 ? (
          <ChatEmptyState />
        ) : (
          <>
            {displayMessages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onOpenCanvas={onOpenCanvas}
                onCanvasDownload={onCanvasDownload}
                onCanvasPrint={onCanvasPrint}
                isStreaming={streamingState?.isStreaming}
                streamingUpdates={streamingState?.updates || []}
                streamingSources={streamingState?.sources || []}
                streamingProgress={streamingState?.progress || { phase: '', progress: 0 }}
                stratixStreamingState={stratixStreamingState}
                alegeonStreamingState={alegeonStreamingState}
              />
            ))}
            
            {/* Show typing indicator when AI is generating response */}
            {isTyping && (
              <div className="flex items-start gap-3 w-full">
                <div className="w-8 h-8 flex-shrink-0 mt-1">
                  {/* AI Avatar placeholder for typing */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-xs font-medium">AI</span>
                  </div>
                </div>
                <div className="flex-1">
                  <TypingIndicator />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Chat Input - Fixed at bottom, passed through from parent */}
    </div>
  );
};

export default ChatArea;
