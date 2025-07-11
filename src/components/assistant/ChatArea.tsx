
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessage from '@/components/assistant/ChatMessage';
import TypingIndicator from '@/components/assistant/TypingIndicator';
import PerplexityEmptyState from '@/components/assistant/PerplexityEmptyState';
import EnhancedChatInput from '@/components/assistant/EnhancedChatInput';
import StreamingProgress from '@/components/assistant/StreamingProgress';
import StreamingError from '@/components/assistant/StreamingError';
import { Message } from '@/constants/aiAssistant';

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
    searchQueries: string[];
    discoveredSources: Array<{
      name: string;
      url: string;
      type: string;
      confidence: number;
    }>;
  };
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
  streamingState
}) => {
  const hasConversation = messages.length > 1 || isTyping;

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
            {/* Show streaming error if present */}
            {streamingState?.error && (
              <StreamingError
                error={streamingState.error}
                errorCode={streamingState.errorCode}
                retryAfter={streamingState.retryAfter}
                isVisible={true}
              />
            )}

            {/* Show Perplexity-style streaming progress */}
            {streamingState?.isStreaming && (
              <StreamingProgress
                currentPhase={streamingState.currentPhase}
                progress={streamingState.progress}
                searchQueries={streamingState.searchQueries}
                discoveredSources={streamingState.discoveredSources}
                activeAgents={streamingState.activeAgents}
                collaborationMode={streamingState.collaborationMode}
                isVisible={true}
              />
            )}

            {messages.map((msg) => {
              console.log('🔄 ChatArea: Rendering message', {
                messageId: msg.id,
                sender: msg.sender,
                hasStreamingState: !!streamingState,
                isStreaming: streamingState?.isStreaming,
                messageText: msg.text.substring(0, 50)
              });

              return (
                <ChatMessage 
                  key={msg.id} 
                  message={{ ...msg, timestamp: formatTimestamp(msg.timestamp) }}
                  onOpenCanvas={onOpenCanvas}
                  onCanvasDownload={onCanvasDownload}
                  onCanvasPrint={onCanvasPrint}
                  // Simplified props for new system
                  isStreaming={false} // Individual message streaming removed
                  streamingUpdates={[]}
                  streamingSources={[]}
                  streamingProgress={{ phase: '', progress: 0 }}
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

// Helper function moved from constants
const formatTimestamp = (timestamp: Date): string => {
  return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default ChatArea;
