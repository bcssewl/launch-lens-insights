
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
  // Enhanced citation support
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
  const [isSourcesSidebarOpen, setIsSourcesSidebarOpen] = useState(false);
  
  const isAi = message.sender === 'ai';
  const isReport = isAi && isReportMessage(message.text, message.metadata);
  
  // Check if this is a streaming message
  const isStreamingMessage = message.isStreaming || (message.metadata?.messageType === 'progress_update' && !message.metadata?.isCompleted);
  
  // For Algeon streaming, show the streaming overlay if this is the streaming message
  const showAlegeonStreaming = isAi && alegeonStreamingState && (
    (alegeonStreamingState.isStreaming && isStreamingMessage) ||
    (alegeonStreamingState.isComplete && message.metadata?.messageType === 'completed_report')
  );

  // Enhanced citation detection - prioritize message citations, then streaming citations
  const messageCitations = message.alegeonCitations || [];
  const streamingCitations = alegeonStreamingState?.citations || [];
  const finalCitations = alegeonStreamingState?.finalCitations || [];
  
  // Use the most appropriate citation source based on message state
  const availableCitations = messageCitations.length > 0 
    ? messageCitations 
    : (finalCitations.length > 0 ? finalCitations : streamingCitations);

  // Check if we should show citations (for completed AI messages with content)
  const shouldShowCitations = isAi && 
    !isStreaming && 
    !showAlegeonStreaming && 
    message.text && 
    message.text.trim() !== '' &&
    availableCitations && 
    availableCitations.length > 0;

  // Enhanced debug logging
  console.log('💬 ChatMessage: Citation debug', {
    messageId: message.id,
    sender: message.sender,
    isStreaming,
    isStreamingMessage,
    showAlegeonStreaming,
    shouldShowCitations,
    messageCitationsCount: messageCitations.length,
    streamingCitationsCount: streamingCitations.length,
    finalCitationsCount: finalCitations.length,
    availableCitationsCount: availableCitations?.length || 0,
    messageType: message.metadata?.messageType,
    messageTextLength: message.text?.length || 0,
    messageTextPreview: message.text?.substring(0, 100) + (message.text?.length > 100 ? '...' : '')
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

  const handleSourcesClick = () => {
    console.log('🔍 Sources button clicked, opening sidebar');
    setIsSourcesSidebarOpen(true);
  };

  const handleSourcesSidebarClose = () => {
    console.log('❌ Sources sidebar closed');
    setIsSourcesSidebarOpen(false);
  };

  return (
    <>
      <div
        className={cn(
          "flex items-start gap-3 w-full transition-all duration-300",
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
              "group relative transition-all duration-300",
              'max-w-[90vw] sm:max-w-[80vw] md:max-w-xl lg:max-w-2xl xl:max-w-3xl',
              "p-3 rounded-2xl",
              isAi 
                ? "bg-white/10 backdrop-blur-md border border-white/20 text-foreground rounded-tl-sm shadow-glass hover:bg-white/15 hover:border-white/30"
                : "bg-primary/90 backdrop-blur-md border border-primary/30 text-primary-foreground rounded-tr-sm shadow-glass hover:bg-primary/95"
            )}
          >
            {/* Algeon Streaming Overlay - Show for streaming messages only */}
            {showAlegeonStreaming && isStreamingMessage && (
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
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <CopyButton content={message.text} />
              </div>
            )}

            {/* Message content - hide when showing streaming overlay for streaming messages */}
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
                    ) : shouldShowCitations ? (
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
      {shouldShowCitations && (
        <SourcesSidebar
          isOpen={isSourcesSidebarOpen}
          onClose={handleSourcesSidebarClose}
          citations={availableCitations}
        />
      )}
    </>
  );
};

export default ChatMessage;
