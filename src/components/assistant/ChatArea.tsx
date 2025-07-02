
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSidebar } from '@/components/ui/sidebar';
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
  const { state: sidebarState } = useSidebar();

  // Calculate the left offset based on sidebar state
  const sidebarOffset = React.useMemo(() => {
    if (sidebarState === 'expanded') {
      return 'var(--sidebar-width)'; // 16rem by default
    } else {
      return 'var(--sidebar-width-icon)'; // 3rem by default
    }
  }, [sidebarState]);

  if (!hasConversation) {
    // Show Perplexity-inspired empty state - NO CANVAS HERE
    return (
      <div className="flex flex-col flex-1 min-h-0 w-full relative bg-background">
        <div className="flex-1 min-h-0 overflow-hidden">
          <PerplexityEmptyState onSendMessage={onSendMessage} />
        </div>
      </div>
    );
  }

  // Show conversation with compact input - NO CANVAS HERE
  return (
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
                onCanvasDownload={onCanvasDownload}
                onCanvasPrint={onCanvasPrint}
              />
            ))}
            {isTyping && <TypingIndicator />}
          </div>
          <div className="h-24" /> {/* Spacer for input */}
        </ScrollArea>
      </div>

      {/* Fixed Input Area - now responsive to sidebar */}
      <div 
        className="fixed bottom-0 right-0 z-10"
        style={{
          left: sidebarOffset,
        }}
      >
        <EnhancedChatInput 
          onSendMessage={onSendMessage} 
          isTyping={isTyping}
          isCompact={true}
        />
      </div>
    </div>
  );
};

// Helper function moved from constants
const formatTimestamp = (timestamp: Date): string => {
  return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default ChatArea;
