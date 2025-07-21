import React, { useState, useCallback, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessage from '@/components/assistant/ChatMessage';
import EnhancedChatInput from '@/components/assistant/EnhancedChatInput';
import ChatEmptyState from '@/components/assistant/ChatEmptyState';
import StreamingError from '@/components/assistant/StreamingError';
import { StreamingProgress } from '@/components/assistant/StreamingProgress';
import { StreamingOverlay } from '@/components/assistant/StreamingOverlay';
import { StratixStreamingOverlay } from '@/components/assistant/StratixStreamingOverlay';
import { AlegeonStreamingOverlay } from '@/components/assistant/AlegeonStreamingOverlay';
import type { Message, StreamingState, StratixStreamingState } from '@/types/stratixStreaming';

interface ChatAreaProps {
  messages: Message[];
  isTyping: boolean;
  viewportRef: React.RefObject<HTMLDivElement>;
  onSendMessage: (text: string, attachments?: any[], modelOverride?: string, researchType?: string) => void;
  selectedModel: string;
  onOpenCanvas: (content: string) => void;
  onCloseCanvas: () => void;
  onCanvasDownload: () => void;
  onCanvasPrint: () => void;
  streamingState?: StreamingState;
  stratixStreamingState?: StratixStreamingState;
  alegeonStreamingState?: any;
  onAlegeonFastForward?: () => void;
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
  alegeonStreamingState,
  onAlegeonFastForward
}) => {
  const [showStreamingIndicator, setShowStreamingIndicator] = useState(false);
  const [streamingProgress, setStreamingProgress] = useState<{
    current: number;
    total: number;
    status: string;
  } | null>(null);

  useEffect(() => {
    if (streamingState?.isStreaming || stratixStreamingState?.isStreaming || alegeonStreamingState?.isStreaming) {
      setShowStreamingIndicator(true);
    } else {
      const timer = setTimeout(() => {
        setShowStreamingIndicator(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [streamingState?.isStreaming, stratixStreamingState?.isStreaming, alegeonStreamingState?.isStreaming]);

  useEffect(() => {
    if (streamingState) {
      setStreamingProgress({
        current: streamingState.progress || 0,
        total: 100,
        status: streamingState.status || 'Processing...'
      });
    } else if (stratixStreamingState) {
      setStreamingProgress({
        current: stratixStreamingState.progress || 0,
        total: 100,
        status: stratixStreamingState.status || 'Analyzing...'
      });
    } else if (alegeonStreamingState) {
      setStreamingProgress({
        current: alegeonStreamingState.progress || 0,
        total: 100,
        status: alegeonStreamingState.status || 'Researching...'
      });
    } else {
      setStreamingProgress(null);
    }
  }, [streamingState, stratixStreamingState, alegeonStreamingState]);

  const handleSendMessageWrapper = useCallback((text: string, attachments?: any[], modelOverride?: string, researchType?: string) => {
    onSendMessage(text, attachments, modelOverride, researchType);
  }, [onSendMessage]);

  const hasMessages = messages.length > 0;

  return (
    <div className="h-full flex flex-col relative bg-background/10 backdrop-blur-sm">
      {/* Chat Messages Area - takes all available space above input */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full w-full" viewportRef={viewportRef}>
          <div className="max-w-4xl mx-auto px-6 py-8 pb-8 space-y-8">
            {streamingState?.error && (
              <StreamingError
                error={streamingState.error}
                onRetry={() => {
                  // Handle retry logic if needed
                }}
              />
            )}

            {!hasMessages ? (
              <ChatEmptyState 
                onSendMessage={handleSendMessageWrapper}
                selectedModel={selectedModel}
              />
            ) : (
              <>
                {messages.map((message, index) => (
                  <ChatMessage
                    key={`${message.id}-${index}`}
                    message={message}
                    onOpenCanvas={onOpenCanvas}
                    onCloseCanvas={onCloseCanvas}
                    onCanvasDownload={onCanvasDownload}
                    onCanvasPrint={onCanvasPrint}
                  />
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-surface-elevated rounded-2xl px-4 py-3 max-w-xs">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area - anchored at bottom of chat container */}
      <div className="w-full max-w-4xl mx-auto px-6 py-4">
        <EnhancedChatInput 
          onSendMessage={onSendMessage} 
          isTyping={isTyping}
          isCompact={true}
          selectedModel={selectedModel}
        />
      </div>

      {/* Streaming Overlays */}
      {showStreamingIndicator && streamingProgress && (
        <StreamingProgress
          current={streamingProgress.current}
          total={streamingProgress.total}
          status={streamingProgress.status}
        />
      )}

      {streamingState?.isStreaming && (
        <StreamingOverlay streamingState={streamingState} />
      )}

      {stratixStreamingState?.isStreaming && (
        <StratixStreamingOverlay streamingState={stratixStreamingState} />
      )}

      {alegeonStreamingState?.isStreaming && (
        <AlegeonStreamingOverlay 
          streamingState={alegeonStreamingState}
          onFastForward={onAlegeonFastForward}
        />
      )}
    </div>
  );
};

export default ChatArea;
