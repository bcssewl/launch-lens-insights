
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessage from '@/components/assistant/ChatMessage';
import TypingIndicator from '@/components/assistant/TypingIndicator';
import PerplexityEmptyState from '@/components/assistant/PerplexityEmptyState';
import EnhancedChatInput from '@/components/assistant/EnhancedChatInput';
import CanvasView from '@/components/assistant/CanvasView';
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
  onCloseInlineCanvas?: (messageId: string) => void;
  onCanvasDownload?: () => void;
  onCanvasPrint?: () => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isTyping,
  viewportRef,
  onSendMessage,
  canvasState,
  onOpenCanvas,
  onCloseCanvas,
  onCloseInlineCanvas,
  onCanvasDownload,
  onCanvasPrint
}) => {
  const hasConversation = messages.length > 1 || isTyping;

  if (!hasConversation) {
    // Show Perplexity-inspired empty state with proper background
    return (
      <>
        <div className="flex flex-col flex-1 min-h-0 w-full relative bg-background">
          <div className="flex-1 min-h-0 overflow-hidden">
            <PerplexityEmptyState onSendMessage={onSendMessage} />
          </div>
        </div>
        
        {/* Canvas View */}
        {canvasState && (
          <CanvasView
            isOpen={canvasState.isOpen}
            onClose={onCloseCanvas || (() => {})}
            content={canvasState.content}
            title="AI Report"
            onDownload={onCanvasDownload}
            onPrint={onCanvasPrint}
          />
        )}
      </>
    );
  }

  // Show conversation with compact input and proper background
  return (
    <>
      <div className="flex flex-col flex-1 min-h-0 w-full relative bg-background">
        {/* Chat Messages Area */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full w-full" viewportRef={viewportRef}>
            <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
              {messages.map((msg) => (
                <ChatMessage 
                  key={msg.id} 
                  message={{ ...msg, timestamp: formatTimestamp(msg.timestamp) }}
                  onOpenCanvas={onOpenCanvas}
                  onCloseCanvas={onCloseInlineCanvas}
                />
              ))}
              {isTyping && <TypingIndicator />}
            </div>
            <div className="h-24" /> {/* Spacer for input */}
          </ScrollArea>
        </div>

        {/* Fixed Input Area */}
        <div className="fixed bottom-0 left-0 right-0 z-10 bg-transparent">
          <EnhancedChatInput 
            onSendMessage={onSendMessage} 
            isTyping={isTyping}
            isCompact={true}
          />
        </div>
      </div>

      {/* Canvas View */}
      {canvasState && (
        <CanvasView
          isOpen={canvasState.isOpen}
          onClose={onCloseCanvas || (() => {})}
          content={canvasState.content}
          title="AI Report"
          onDownload={onCanvasDownload}
          onPrint={onCanvasPrint}
        />
      )}
    </>
  );
};

// Helper function moved from constants
const formatTimestamp = (timestamp: Date): string => {
  return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default ChatArea;
