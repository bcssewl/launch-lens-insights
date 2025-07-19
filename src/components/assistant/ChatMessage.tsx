
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import AIAvatar from './AIAvatar';
import UserAvatar from './UserAvatar';
import CopyButton from './CopyButton';
import MarkdownRenderer from './MarkdownRenderer';
import SimpleCitations from './SimpleCitations';
import CanvasCompact from './CanvasCompact';
import StreamingOverlay from './StreamingOverlay';
import StratixStreamingOverlay from './StratixStreamingOverlay';
import OptimizedStreamingOverlay from './OptimizedStreamingOverlay';
import { isReportMessage } from '@/utils/reportDetection';
import type { StratixStreamingState } from '@/types/stratixStreaming';
import type { AlegeonStreamingState } from '@/hooks/useAlegeonStreaming';

export interface ChatMessageData {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  timestamp: string;
  metadata?: {
    isCompleted?: boolean;
    messageType?: 'progress_update' | 'completed_report' | 'standard' | 'stratix_conversation';
  };
  finalCitations?: Array<{
    name: string;
    url: string;
    type?: string;
  }>;
  isStreaming?: boolean;
}

interface StreamingUpdate {
  type: 'search' | 'source' | 'snippet' | 'thought' | 'complete';
  message: string;
  timestamp: number;
  data?: any;
}

interface ChatMessageProps {
  message: ChatMessageData;
  onOpenCanvas?: (messageId: string, content: string) => void;
  onCanvasDownload?: () => void;
  onCanvasPrint?: () => void;
  isStreaming?: boolean;
  streamingUpdates?: StreamingUpdate[];
  streamingSources?: Array<{
    name: string;
    url: string;
    type?: string;
    confidence?: number;
  }>;
  streamingProgress?: {
    phase: string;
    progress: number;
  };
  stratixStreamingState?: StratixStreamingState;
  alegeonStreamingState?: AlegeonStreamingState;
}

const ChatMessage: React.FC<ChatMessageProps> = React.memo(({ 
  message, 
  onOpenCanvas,
  onCanvasDownload,
  onCanvasPrint,
  isStreaming = false,
  streamingUpdates = [],
  streamingSources = [],
  streamingProgress = { phase: '', progress: 0 },
  stratixStreamingState,
  alegeonStreamingState
}) => {
  const isAi = message.sender === 'ai';
  const isReport = isAi && isReportMessage(message.text, message.metadata);
  
  // Check if this is a streaming message
  const isStreamingMessage = message.isStreaming || (message.metadata?.messageType === 'progress_update' && !message.metadata?.isCompleted);
  
  // For Algeon streaming, show the overlay if this is the streaming message
  const showAlegeonStreaming = isAi && alegeonStreamingState && (
    (alegeonStreamingState.isStreaming && isStreamingMessage) ||
    (alegeonStreamingState.isComplete && message.metadata?.messageType === 'completed_report')
  );

  // Enhanced citation handling: Get citations from multiple sources with priority
  const messageCitations = message.finalCitations || 
    (alegeonStreamingState?.isComplete && alegeonStreamingState?.citations) || 
    [];

  console.log('💬 ChatMessage: Rendering message with citations:', {
    messageId: message.id,
    sender: message.sender,
    hasMessageCitations: !!message.finalCitations,
    hasAlegeonCitations: !!(alegeonStreamingState?.citations),
    finalCitationsCount: messageCitations.length,
    citationsPreview: messageCitations.slice(0, 2)
  });

  // Don't render AI messages with empty content unless streaming
  if (isAi && (!message.text || message.text.trim() === '') && !showAlegeonStreaming && !stratixStreamingState?.isStreaming) {
    return null;
  }

  const handleCanvasExpand = () => {
    if (onOpenCanvas) {
      onOpenCanvas(message.id, message.text);
    }
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 w-full transition-all duration-300",
        isAi ? "justify-start" : "justify-end"
      )}
      style={{ width: '100%' }}
    >
      {isAi && (
        <AIAvatar className="w-8 h-8 flex-shrink-0 mt-1" />
      )}

      <div className={cn("flex flex-col", isAi ? "items-start" : "items-end")}>
        <div
          className={cn(
            "group relative transition-all duration-300",
            'max-w-[90vw] sm:max-w-[80vw] md:max-w-xl lg:max-w-2xl xl:max-w-3xl',
            "p-3 rounded-2xl",
            isAi 
              ? "bg-white/10 backdrop-blur-md border border-white/20 text-foreground rounded-tl-sm shadow-glass hover:bg-white/15 hover:border-white/30"
              : "bg-primary/90 backdrop-blur-md border border-primary/30 text-primary-foreground rounded-tr-sm shadow-glass hover:bg-primary/95"
          )}
        >
          {/* Optimized Algeon Streaming Overlay */}
          {showAlegeonStreaming && (
            <OptimizedStreamingOverlay
              streamingState={alegeonStreamingState!}
              className="absolute inset-0 z-20 rounded-2xl"
            />
          )}

          {/* Stratix Streaming Overlay */}
          {isAi && stratixStreamingState?.isStreaming && (
            <StratixStreamingOverlay
              isVisible={stratixStreamingState.isStreaming}
              streamingState={stratixStreamingState}
              className="z-10"
            />
          )}

          {/* Fallback streaming overlay */}
          {isAi && !stratixStreamingState?.isStreaming && !showAlegeonStreaming && (isStreaming || streamingUpdates.length > 0) && (
            <StreamingOverlay
              isVisible={isStreaming}
              updates={streamingUpdates}
              sources={streamingSources}
              progress={streamingProgress}
              className="z-10"
            />
          )}

          {/* Copy button */}
          {isAi && !showAlegeonStreaming && !stratixStreamingState?.isStreaming && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <CopyButton content={message.text} />
            </div>
          )}

          {/* Message content */}
          {!(showAlegeonStreaming && isStreamingMessage) && (
            <div className={cn(
              "text-sm leading-relaxed", 
              isAi && !stratixStreamingState?.isStreaming && "pr-8"
            )}>
              {isAi ? (
                <>
                  {isReport && !isStreamingMessage ? (
                    <CanvasCompact
                      content={message.text}
                      onExpand={handleCanvasExpand}
                      onDownload={onCanvasDownload}
                      onPrint={onCanvasPrint}
                    />
                  ) : (
                    <MarkdownRenderer content={message.text} />
                  )}
                  
                  {/* Enhanced citation display: Only show citations for completed messages */}
                  {!isStreamingMessage && !showAlegeonStreaming && messageCitations.length > 0 && (
                    <SimpleCitations citations={messageCitations} />
                  )}
                </>
              ) : (
                <p className="whitespace-pre-wrap">{message.text}</p>
              )}
            </div>
          )}
        </div>
        <p className={cn(
          "text-xs mt-1 opacity-70 px-1",
          isAi ? "text-muted-foreground" : "text-muted-foreground"
        )}>
          {message.timestamp}
        </p>
      </div>
      {!isAi && (
        <UserAvatar className="h-8 w-8 flex-shrink-0 mt-1" />
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Enhanced comparison to prevent unnecessary re-renders
  if (prevProps.message.id !== nextProps.message.id) {
    return false;
  }
  
  const prevAlgeonState = prevProps.alegeonStreamingState;
  const nextAlgeonState = nextProps.alegeonStreamingState;
  
  // If Algeon streaming is active, only update when displayedText changes
  if (nextAlgeonState?.isStreaming) {
    if (!prevAlgeonState?.isStreaming) return false;
    if (prevAlgeonState.displayedText !== nextAlgeonState.displayedText) return false;
    return true;
  }
  
  // For non-streaming messages, check basic properties including citations
  return (
    prevProps.message.text === nextProps.message.text &&
    prevProps.isStreaming === nextProps.isStreaming &&
    (prevAlgeonState?.isComplete === nextAlgeonState?.isComplete) &&
    JSON.stringify(prevProps.message.finalCitations) === JSON.stringify(nextProps.message.finalCitations)
  );
});

ChatMessage.displayName = 'ChatMessage';

export default ChatMessage;
