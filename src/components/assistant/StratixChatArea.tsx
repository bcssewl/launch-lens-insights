import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import StratixChatMessage from '@/components/assistant/StratixChatMessage';
import TypingIndicator from '@/components/assistant/TypingIndicator';
import PerplexityEmptyState from '@/components/assistant/PerplexityEmptyState';
import EnhancedChatInput from '@/components/assistant/EnhancedChatInput';
import { StratixChatMessageData } from '@/components/assistant/StratixChatMessage';

interface StratixChatAreaProps {
  messages: StratixChatMessageData[];
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
}

const StratixChatArea: React.FC<StratixChatAreaProps> = ({
  messages,
  isTyping,
  viewportRef,
  onSendMessage,
  selectedModel,
  onOpenCanvas,
  onCanvasDownload,
  onCanvasPrint
}) => {
  const hasConversation = messages.length > 1 || isTyping;

  if (!hasConversation) {
    // Show Perplexity-inspired empty state with transparent background
    return (
      <div className="flex flex-col flex-1 min-h-0 w-full relative bg-transparent">
        <PerplexityEmptyState 
          onSendMessage={onSendMessage}
          selectedModel={selectedModel}
        />
      </div>
    );
  }

  // Show conversation with Stratix-specific message components
  return (
    <div className="h-full flex flex-col relative bg-background/10 backdrop-blur-sm">
      {/* Chat Messages Area with proper scrolling */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full w-full" viewportRef={viewportRef}>
          <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
            {messages.map((msg) => (
              <StratixChatMessage 
                key={msg.id} 
                message={msg}
                onOpenCanvas={onOpenCanvas}
                onCanvasDownload={onCanvasDownload}
                onCanvasPrint={onCanvasPrint}
              />
            ))}
            {isTyping && <TypingIndicator />}
          </div>
          {/* Spacer for input */}
          <div className="h-24" />
        </ScrollArea>
      </div>

      {/* Floating Input Area */}
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

export default StratixChatArea;