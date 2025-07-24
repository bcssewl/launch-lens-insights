
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import AIAvatar from './AIAvatar';
import UserAvatar from './UserAvatar';
import CanvasButton from './CanvasButton';
import CopyButton from './CopyButton';
import MarkdownRenderer from './MarkdownRenderer';
import CitationAwareRenderer from './CitationAwareRenderer';
import SourcesSidebar from './SourcesSidebar';
import CanvasCompact from './CanvasCompact';
import StreamingOverlay from './StreamingOverlay';
import StratixStreamingOverlay from './StratixStreamingOverlay';
import EnhancedStreamingOverlay from './EnhancedStreamingOverlay';
import ThinkingPanel from './ThinkingPanel';
import { isReportMessage } from '@/utils/reportDetection';
import type { StratixStreamingState } from '@/types/stratixStreaming';
import type { AlegeonStreamingStateV2 } from '@/hooks/useAlegeonStreamingV2';

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
  alegeonStreamingState?: AlegeonStreamingStateV2;
  iiResearchStreamingState?: any; // IIResearchStreamingState will be imported later
  onToggleCanvasPreview?: (messageId: string) => void;
  isCanvasPreview?: boolean;
  onAlegeonFastForward?: () => void;
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
  alegeonStreamingState,
  iiResearchStreamingState,
  onToggleCanvasPreview,
  isCanvasPreview = false,
  onAlegeonFastForward
}) => {
  const [isSourcesSidebarOpen, setIsSourcesSidebarOpen] = useState(false);
  
  const isAi = message.sender === 'ai';
  const isReport = isAi && isCanvasPreview;
  
  const isStreamingMessage = message.isStreaming || (message.metadata?.messageType === 'progress_update' && !message.metadata?.isCompleted);
  
  // Updated streaming detection for V2
  const showAlegeonStreaming = isAi && alegeonStreamingState && alegeonStreamingState.isStreaming && !alegeonStreamingState.isComplete;

  // Enhanced citation detection with V2 state
  const availableCitations = message.alegeonCitations || 
    (alegeonStreamingState?.citations?.length ? alegeonStreamingState.citations : null);

  console.log('🎯 ChatMessage V2: Citation detection', {
    messageId: message.id,
    hasMessageCitations: !!message.alegeonCitations?.length,
    hasStreamingCitations: !!alegeonStreamingState?.citations?.length,
    availableCitationsCount: availableCitations?.length || 0,
    alegeonStreamingState: {
      isStreaming: alegeonStreamingState?.isStreaming,
      currentPhase: alegeonStreamingState?.currentPhase,
      isComplete: alegeonStreamingState?.isComplete,
      hasContent: alegeonStreamingState?.hasContent,
      displayedTextLength: alegeonStreamingState?.displayedText?.length || 0,
      bufferedTextLength: alegeonStreamingState?.bufferedText?.length || 0
    },
    showAlegeonStreaming,
    isReport
  });

  if (availableCitations && availableCitations.length > 0) {
    console.log('📚 V2 Available citations with URLs:', availableCitations.map(cite => ({
      title: cite.title || cite.name,
      url: cite.url,
      hasUrl: !!cite.url,
      description: cite.description
    })));
  }

  const shouldUseCitationRenderer = isAi && availableCitations && availableCitations.length > 0 && !isReport && !showAlegeonStreaming;

  console.log('🎯 ChatMessage V2: Rendering decision', {
    messageId: message.id,
    shouldUseCitationRenderer,
    showAlegeonStreaming,
    currentPhase: alegeonStreamingState?.currentPhase,
    isReport,
    messageTextLength: message.text?.length || 0
  });

  if (isAi && (!message.text || message.text.trim() === '') && !showAlegeonStreaming && !stratixStreamingState?.isStreaming) {
    return null;
  }

  const handleCanvasExpand = () => {
    if (onOpenCanvas) {
      onOpenCanvas(message.id, message.text);
    }
  };

  const handleToggleCanvasPreview = () => {
    if (onToggleCanvasPreview) {
      onToggleCanvasPreview(message.id);
    }
  };

  const handleSourcesClick = () => {
    console.log('📋 V2 Sources button clicked, opening sidebar with citations:', availableCitations);
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
            {/* Message-specific Agent's Thought Process Panel */}
            {isAi && (
              <ThinkingPanel messageId={message.id} />
            )}

            {/* Enhanced Algeon V2 Streaming Overlay */}
            {showAlegeonStreaming && (
              <EnhancedStreamingOverlay
                streamingState={alegeonStreamingState!}
                className="absolute inset-0 z-20 rounded-2xl"
                onFastForward={onAlegeonFastForward}
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

            {/* Action buttons */}
            {isAi && !showAlegeonStreaming && !stratixStreamingState?.isStreaming && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                <CopyButton content={message.text} />
                {message.text && message.text.trim().split(/\s+/).length >= 100 && (
                  <CanvasButton 
                    onClick={handleToggleCanvasPreview} 
                    variant={isCanvasPreview ? "active" : "default"}
                  />
                )}
              </div>
            )}

            {/* Message content - Show content when NOT actively streaming */}
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
                    ) : shouldUseCitationRenderer ? (
                      <CitationAwareRenderer
                        content={alegeonStreamingState?.displayedText || message.text}
                        citations={availableCitations!.map(cite => ({
                          name: cite.title || cite.name || 'Unknown Source',
                          url: cite.url,
                          type: cite.type || 'web'
                        }))}
                        onSourcesClick={handleSourcesClick}
                      />
                    ) : (
                      <MarkdownRenderer content={alegeonStreamingState?.displayedText || message.text} />
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
          citations={availableCitations.map(cite => ({
            name: cite.title || cite.name || 'Unknown Source',
            url: cite.url,
            type: cite.type || 'web'
          }))}
        />
      )}
    </>
  );
}, (prevProps, nextProps) => {
  if (prevProps.message.id !== nextProps.message.id) {
    return false;
  }
  
  const prevAlgeonState = prevProps.alegeonStreamingState;
  const nextAlgeonState = nextProps.alegeonStreamingState;
  
  // Enhanced comparison for V2 streaming
  if (nextAlgeonState?.isStreaming) {
    if (!prevAlgeonState?.isStreaming) return false;
    if (prevAlgeonState.displayedText !== nextAlgeonState.displayedText) return false;
    if (prevAlgeonState.currentPhase !== nextAlgeonState.currentPhase) return false;
    return true;
  }
  
  if (prevAlgeonState?.isStreaming && !nextAlgeonState?.isStreaming) {
    return false;
  }
  
  return (
    prevProps.message.text === nextProps.message.text &&
    prevProps.isStreaming === nextProps.isStreaming &&
    prevProps.isCanvasPreview === nextProps.isCanvasPreview &&
    (prevAlgeonState?.isComplete === nextAlgeonState?.isComplete) &&
    (prevAlgeonState?.displayedText === nextAlgeonState?.displayedText) &&
    (prevAlgeonState?.currentPhase === nextAlgeonState?.currentPhase)
  );
});

ChatMessage.displayName = 'ChatMessage';

export default ChatMessage;
