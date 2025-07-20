
import React, { useState, useCallback, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessage from '@/components/assistant/ChatMessage';
import TypingIndicator from '@/components/assistant/TypingIndicator';
import PerplexityEmptyState from '@/components/assistant/PerplexityEmptyState';
import EnhancedChatInput from '@/components/assistant/EnhancedChatInput';
import StreamingProgress from '@/components/assistant/StreamingProgress';
import StreamingError from '@/components/assistant/StreamingError';
import { Message } from '@/constants/aiAssistant';
import type { StratixStreamingState } from '@/types/stratixStreaming';
import type { AlegeonStreamingStateV2 } from '@/hooks/useAlegeonStreamingV2';

interface ChatAreaProps {
  messages: Message[];
  isTyping: boolean;
  viewportRef: React.RefObject<HTMLDivElement>;
  onSendMessage: (message: string, attachments?: any[], selectedModel?: string) => void;
  selectedModel: string;
  canvasState?: {
    isOpen: boolean;
    messageId: string | null;
    content: string;
  };
  onOpenCanvas?: (messageId: string, content: string) => void;
  onCloseCanvas?: () => void;
  onCanvasDownload?: () => void;
  onCanvasPrint?: () => void;
  streamingState?: {
    isStreaming: boolean;
    currentPhase: string;
    progress: number;
    error?: string | null;
    errorCode?: string;
    retryAfter?: number;
    searchQueries: string[];
    discoveredSources: Array<{
      name: string;
      url: string;
      type: string;
      confidence: number;
    }>;
    activeAgents?: string[];
    collaborationMode?: string;
  };
  stratixStreamingState?: StratixStreamingState;
  alegeonStreamingState?: AlegeonStreamingStateV2;
  onAlegeonFastForward?: () => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isTyping,
  viewportRef,
  onSendMessage,
  selectedModel,
  onOpenCanvas,
  onCanvasDownload,
  onCanvasPrint,
  streamingState,
  stratixStreamingState,
  alegeonStreamingState,
  onAlegeonFastForward
}) => {
  const [canvasPreviewMessages, setCanvasPreviewMessages] = useState<Set<string>>(new Set());

  const handleToggleCanvasPreview = useCallback((messageId: string) => {
    setCanvasPreviewMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  }, []);

  const hasConversation = messages.length > 1 || isTyping;

  useEffect(() => {
    if (hasConversation && viewportRef.current) {
      const timer = setTimeout(() => {
        if (viewportRef.current) {
          viewportRef.current.scrollTo({
            top: viewportRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [hasConversation, viewportRef]);

  if (!hasConversation) {
    return (
      <div className="flex flex-col flex-1 min-h-0 w-full relative bg-transparent">
        <PerplexityEmptyState 
          onSendMessage={onSendMessage}
          selectedModel={selectedModel}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative bg-background/10 backdrop-blur-sm">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full w-full" viewportRef={viewportRef}>
          <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
            {streamingState?.error && (
              <StreamingError
                error={streamingState.error}
                errorCode={streamingState.errorCode}
                retryAfter={streamingState.retryAfter}
                isVisible={true}
              />
            )}

            {streamingState?.isStreaming && !stratixStreamingState?.isStreaming && !alegeonStreamingState?.isStreaming && (
              <StreamingProgress
                currentPhase={streamingState.currentPhase}
                progress={streamingState.progress}
                searchQueries={streamingState.searchQueries}
                discoveredSources={streamingState.discoveredSources}
                activeAgents={streamingState.activeAgents?.map(name => ({ name, status: 'active' as const, progress: 50 })) || []}
                collaborationMode={streamingState.collaborationMode as 'sequential' | 'parallel' | 'hierarchical' | null}
                isVisible={true}
              />
            )}

            {messages.map((msg) => {
              return (
                <ChatMessage 
                  key={msg.id} 
                  message={{ ...msg, timestamp: formatTimestamp(msg.timestamp) }}
                  onOpenCanvas={onOpenCanvas}
                  onCanvasDownload={onCanvasDownload}
                  onCanvasPrint={onCanvasPrint}
                  onToggleCanvasPreview={handleToggleCanvasPreview}
                  isCanvasPreview={canvasPreviewMessages.has(msg.id)}
                  isStreaming={false}
                  streamingUpdates={[]}
                  streamingSources={[]}
                  streamingProgress={{ phase: '', progress: 0 }}
                  stratixStreamingState={stratixStreamingState}
                  alegeonStreamingState={alegeonStreamingState}
                  onAlegeonFastForward={onAlegeonFastForward}
                />
              );
            })}
            {isTyping && <TypingIndicator />}
          </div>
          <div className="h-24" />
        </ScrollArea>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <EnhancedChatInput 
            onSendMessage={onSendMessage} 
            isTyping={isTyping}
            isCompact={true}
            selectedModel={selectedModel}
          />
        </div>
      </div>
    </div>
  );
};

const formatTimestamp = (timestamp: Date): string => {
  return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default ChatArea;
