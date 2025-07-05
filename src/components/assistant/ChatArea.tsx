
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessage from '@/components/assistant/ChatMessage';
import TypingIndicator from '@/components/assistant/TypingIndicator';
import PerplexityEmptyState from '@/components/assistant/PerplexityEmptyState';
import EnhancedChatInput from '@/components/assistant/EnhancedChatInput';
import { Message } from '@/constants/aiAssistant';

interface ChatAreaProps {
  messages: Message[];
  isTyping: boolean;
  viewportRef: React.RefObject<HTMLDivElement>;
  onSendMessage: (message: string) => void;
  canvasState?: {
    isOpen: boolean;
    messageId: string | null;
    content: string;
  };
  onOpenCanvas?: (messageId: string, content: string) => void;
  onCloseCanvas?: () => void;
  onCanvasDownload?: () => void;
  onCanvasPrint?: () => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isTyping,
  viewportRef,
  onSendMessage,
  onOpenCanvas,
  onCanvasDownload,
  onCanvasPrint
}) => {
  const hasConversation = messages.length > 1 || isTyping;

  if (!hasConversation) {
    // Show Perplexity-inspired empty state with transparent background
    return (
      <div className="flex flex-col flex-1 min-h-0 w-full relative bg-transparent">
        <PerplexityEmptyState onSendMessage={onSendMessage} />
      </div>
    );
  }

  // Show conversation with fixed input bar using flexbox layout
  return (
    <div className="flex flex-col flex-1 min-h-0 w-full relative bg-background/10 backdrop-blur-sm">
      {/* Chat Messages Area - takes all available space and scrolls */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full w-full" viewportRef={viewportRef}>
          <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
            {messages.map((msg) => (
              <ChatMessage 
                key={msg.id} 
                message={{ ...msg, timestamp: formatTimestamp(msg.timestamp) }}
                onOpenCanvas={onOpenCanvas}
                onCanvasDownload={onCanvasDownload}
                onCanvasPrint={onCanvasPrint}
              />
            ))}
            {isTyping && <TypingIndicator />}
          </div>
          {/* Bottom spacer to prevent last message from being hidden behind input */}
          <div className="h-24" />
        </ScrollArea>
      </div>

      {/* Input Bar - fixed at bottom, doesn't scroll */}
      <div className="flex-shrink-0 bg-background/95 backdrop-blur-sm border-t border-border/50 shadow-lg">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <EnhancedChatInput 
            onSendMessage={onSendMessage} 
            isTyping={isTyping}
            isCompact={true}
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
