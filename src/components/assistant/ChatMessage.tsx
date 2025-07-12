
import React from 'react';
import { cn } from '@/lib/utils';
import AIAvatar from './AIAvatar';
import UserAvatar from './UserAvatar';
import CopyButton from './CopyButton';
import MarkdownRenderer from './MarkdownRenderer';
import CanvasCompact from './CanvasCompact';
import StreamingOverlay from './StreamingOverlay';
import StratixStreamingOverlay from './StratixStreamingOverlay';
import { isReportMessage } from '@/utils/reportDetection';
import type { StratixStreamingState } from '@/types/stratixStreaming';

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
  // Enhanced Stratix streaming support
  stratixStreamingState?: StratixStreamingState;
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
  stratixStreamingState
}) => {
  const isAi = message.sender === 'ai';
  const isReport = isAi && isReportMessage(message.text, message.metadata);

  // Enhanced debug logging
  console.log('💬 ChatMessage: Rendering message', {
    messageId: message.id,
    sender: message.sender,
    isStreaming,
    streamingUpdatesCount: streamingUpdates.length,
    streamingSourcesCount: streamingSources.length,
    streamingProgress,
    isReport,
    hasStratixStreaming: !!stratixStreamingState?.isStreaming,
    messageText: message.text?.substring(0, 100) + (message.text?.length > 100 ? '...' : '')
  });

  // Don't render AI messages with empty or whitespace-only content unless streaming
  if (isAi && (!message.text || message.text.trim() === '') && !stratixStreamingState?.isStreaming) {
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
          {/* Enhanced Stratix Streaming Overlay for AI messages */}
          {isAi && stratixStreamingState?.isStreaming && (
            <StratixStreamingOverlay
              isVisible={stratixStreamingState.isStreaming}
              streamingState={stratixStreamingState}
              className="z-10"
            />
          )}

          {/* Fallback to legacy streaming overlay if Stratix not available */}
          {isAi && !stratixStreamingState?.isStreaming && (isStreaming || streamingUpdates.length > 0) && (
            <StreamingOverlay
              isVisible={isStreaming}
              updates={streamingUpdates}
              sources={streamingSources}
              progress={streamingProgress}
              className="z-10"
            />
          )}

          {isAi && (
            <div className="absolute top-2 right-2">
              <CopyButton content={message.text} />
            </div>
          )}

          <div className={cn("text-sm leading-relaxed", isAi && "pr-8")}>
            {isAi ? (
              <>
                {isReport ? (
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
