
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import AIAvatar from './AIAvatar';
import UserAvatar from './UserAvatar';
import CopyButton from './CopyButton';
import MarkdownRenderer from './MarkdownRenderer';
import CitationAwareRenderer from './CitationAwareRenderer';
import SourcesSidebar from './SourcesSidebar';
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
  alegeonCitations?: Array<{
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
  const [isSourcesSidebarOpen, setIsSourcesSidebarOpen] = useState(false);
  
  const isAi = message.sender === 'ai';
  const isReport = isAi && isReportMessage(message.text, message.metadata);
  
  // Check if this is a streaming message
  const isStreamingMessage = message.isStreaming || (message.metadata?.messageType === 'progress_update' && !message.metadata?.isCompleted);
  
  // For Algeon streaming, show the overlay if this is the streaming message
  const showAlegeonStreaming = isAi && alegeonStreamingState && (
    (alegeonStreamingState.isStreaming && isStreamingMessage) ||
    (alegeonStreamingState.isComplete && message.metadata?.messageType === 'completed_report')
  );

  // Enhanced citation detection
  const availableCitations = message.alegeonCitations || 
    (alegeonStreamingState?.finalCitations?.length ? alegeonStreamingState.finalCitations : null) ||
    (alegeonStreamingState?.citations?.length ? alegeonStreamingState.citations : null);

  // Check if this is a completed Algeon message with citations
  const isAlegeonCompleted = isAi && 
    message.metadata?.messageType === 'completed_report' && 
    availableCitations && availableCitations.length > 0;

  // Don't render AI messages with empty content unless streaming
  if (isAi && (!message.text || message.text.trim() === '') && !showAlegeonStreaming && !stratixStreamingState?.isStreaming) {
    return null;
  }

  const handleCanvasExpand = () => {
    if (onOpenCanvas) {
      onOpenCanvas(message.id, message.text);
    }
  };

  const handleSourcesClick = () => {
    setIsSourcesSidebarOpen(true);
  };

  const handleSourcesSidebarClose = () => {
    setIsSourcesSidebarOpen(false);
  };

  return (
    <>
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
            {showAlegeonStreaming && isStreamingMessage && (
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
                    ) : isAlegeonCompleted && availableCitations ? (
                      <CitationAwareRenderer
                        content={message.text}
                        citations={availableCitations}
                        onSourcesClick={handleSourcesClick}
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

      {/* Sources Sidebar */}
      {availableCitations && availableCitations.length > 0 && (
        <SourcesSidebar
          isOpen={isSourcesSidebarOpen}
          onClose={handleSourcesSidebarClose}
          citations={availableCitations}
        />
      )}
    </>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  const prevMessage = prevProps.message;
  const nextMessage = nextProps.message;
  const prevAlgeonState = prevProps.alegeonStreamingState;
  const nextAlgeonState = nextProps.alegeonStreamingState;
  
  // Only re-render if essential props change
  return (
    prevMessage.id === nextMessage.id &&
    prevMessage.text === nextMessage.text &&
    prevMessage.isStreaming === nextMessage.isStreaming &&
    prevProps.isStreaming === nextProps.isStreaming &&
    prevAlgeonState?.isStreaming === nextAlgeonState?.isStreaming &&
    prevAlgeonState?.displayedText === nextAlgeonState?.displayedText &&
    prevAlgeonState?.isComplete === nextAlgeonState?.isComplete
  );
});

ChatMessage.displayName = 'ChatMessage';

export default ChatMessage;
