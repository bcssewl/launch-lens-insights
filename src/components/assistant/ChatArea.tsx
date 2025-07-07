
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessage from '@/components/assistant/ChatMessage';
import TypingIndicator from '@/components/assistant/TypingIndicator';
import PerplexityEmptyState from '@/components/assistant/PerplexityEmptyState';
import EnhancedChatInput from '@/components/assistant/EnhancedChatInput';
import { Message } from '@/constants/aiAssistant';
import { AIModel } from '@/components/assistant/ModelSelectionDropdown';

interface ChatAreaProps {
  messages: Message[];
  isTyping: boolean;
  viewportRef: React.RefObject<HTMLDivElement>;
  onSendMessage: (message: string, selectedModel?: string) => void;
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
  const [selectedModel, setSelectedModel] = useState<string>('best');
  const hasConversation = messages.length > 1 || isTyping;

  const handleModelSelect = (model: AIModel) => {
    setSelectedModel(model.id);
    console.log('Selected AI model:', model.name);
  };

  const handleSendMessage = (message: string) => {
    onSendMessage(message, selectedModel);
  };

  if (!hasConversation) {
    // Show Perplexity-inspired empty state with transparent background
    return (
      <div className="flex flex-col flex-1 min-h-0 w-full relative bg-transparent">
        <PerplexityEmptyState 
          onSendMessage={handleSendMessage}
          selectedModel={selectedModel}
          onModelSelect={handleModelSelect}
        />
      </div>
    );
  }

  // Show conversation with fixed input bar that blends seamlessly
  return (
    <div className="h-full flex flex-col relative bg-background/10 backdrop-blur-sm">
      {/* Chat Messages Area with proper scrolling */}
      <div className="flex-1 overflow-hidden">
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
          {/* Spacer for input */}
          <div className="h-24" />
        </ScrollArea>
      </div>

      {/* Floating Input Area */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <EnhancedChatInput 
            onSendMessage={handleSendMessage} 
            isTyping={isTyping}
            isCompact={true}
            selectedModel={selectedModel}
            onModelSelect={handleModelSelect}
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
