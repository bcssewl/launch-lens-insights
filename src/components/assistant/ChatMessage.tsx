
import React from 'react';
import { cn } from '@/lib/utils';
import AIAvatar from './AIAvatar';
import UserAvatar from './UserAvatar';
import CopyButton from './CopyButton';
import MarkdownRenderer from './MarkdownRenderer';
import CanvasCompact from './CanvasCompact';
import StreamingOverlay from './StreamingOverlay';
import StratixStreamingOverlay from './StratixStreamingOverlay';
import AlegeonStreamingOverlay from './AlegeonStreamingOverlay';
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
  // Enhanced streaming support
  stratixStreamingState?: StratixStreamingState;
  alegeonStreamingState?: AlegeonStreamingState;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
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
  const isStreamingMessage = message.metadata?.messageType === 'progress_update' && !message.metadata?.isCompleted;
  
  // For Algeon streaming, show the streaming overlay if this is the streaming message
  const showAlegeonStreaming = isAi && alegeonStreamingState && (
    (alegeonStreamingState.isStreaming && isStreamingMessage) ||
    (alegeonStreamingState.isComplete && message.metadata?.messageType === 'completed_report')
  );

  // Enhanced debug logging
  console.log('💬 ChatMessage: Rendering message', {
    messageId: message.id,
    sender: message.sender,
    isStreaming,
    isStreamingMessage,
    showAlegeonStreaming,
    alegeonIsStreaming: alegeonStreamingState?.isStreaming,
    alegeonIsComplete: alegeonStreamingState?.isComplete,
    messageType: message.metadata?.messageType,
    isReport,
    hasStratixStreaming: !!stratixStreamingState?.isStreaming,
    messageText: message.text?.substring(0, 100) + (message.text?.length > 100 ? '...' : '')
  });

  // Don't render AI messages with empty or whitespace-only content unless streaming
  if (isAi && (!message.text || message.text.trim() === '') && !showAlegeonStreaming && !stratixStreamingState?.isStreaming) {
    console.log('🚫 Skipping empty AI message:', message.id);
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
        "flex items-start gap-3 w-full transition-all duration-150",
        isAi ? "justify-start" : "justify-end"
      )}
      style={{
        width: '100%',
      }}
    >
      {isAi && (
        <AIAvatar className="w-8 h-8 flex-shrink-0 mt-1" />
      )}

      <div className={cn("flex flex-col", isAi ? "items-start" : "items-end")}>
        <div
          className={cn(
            "group relative transition-all duration-200",
            'max-w-[90vw] sm:max-w-[80vw] md:max-w-xl lg:max-w-2xl xl:max-w-3xl',
            "p-3 rounded-2xl",
            isAi 
              ? "bg-white/10 backdrop-blur-md border border-white/20 text-foreground rounded-tl-sm shadow-glass hover:bg-white/15 hover:border-white/30"
              : "bg-primary/90 backdrop-blur-md border border-primary/30 text-primary-foreground rounded-tr-sm shadow-glass hover:bg-primary/95"
          )}
        >
          {/* Algeon Streaming Overlay - Show for streaming or completed Algeon messages */}
          {showAlegeonStreaming && (
            <AlegeonStreamingOverlay
              streamingState={alegeonStreamingState!}
              className="absolute inset-0 z-20 rounded-2xl"
            />
          )}

          {/* Enhanced Stratix Streaming Overlay for AI messages */}
          {isAi && stratixStreamingState?.isStreaming && (
            <StratixStreamingOverlay
              isVisible={stratixStreamingState.isStreaming}
              streamingState={stratixStreamingState}
              className="z-10"
            />
          )}

          {/* Fallback to legacy streaming overlay if neither Stratix nor Algeon streaming */}
          {isAi && !stratixStreamingState?.isStreaming && !showAlegeonStreaming && (isStreaming || streamingUpdates.length > 0) && (
            <StreamingOverlay
              isVisible={isStreaming}
              updates={streamingUpdates}
              sources={streamingSources}
              progress={streamingProgress}
              className="z-10"
            />
          )}

          {/* Copy button - only show when not streaming */}
          {isAi && !showAlegeonStreaming && !stratixStreamingState?.isStreaming && (
            <div className="absolute top-2 right-2">
              <CopyButton content={message.text} />
            </div>
          )}

          {/* Message content - hide when showing streaming overlay */}
          {!showAlegeonStreaming && (
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
};

export default ChatMessage;
