
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessage from '@/components/assistant/ChatMessage';
import TypingIndicator from '@/components/assistant/TypingIndicator';
import PerplexityEmptyState from '@/components/assistant/PerplexityEmptyState';
import EnhancedChatInput from '@/components/assistant/EnhancedChatInput';
import { useSidebar } from '@/components/ui/sidebar';
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
  
  // Safely get sidebar state - only if we're in a SidebarProvider context
  let sidebarState = 'expanded';
  try {
    const { state } = useSidebar();
    sidebarState = state;
  } catch (error) {
    // We're not in a SidebarProvider context (e.g., fullscreen mode)
    // Use default positioning
  }

  // Calculate proper positioning based on sidebar state for sticky input
  const inputPositionClass = sidebarState === 'expanded' 
    ? 'fixed bottom-0 left-[var(--sidebar-width)] right-0 z-50'
    : 'fixed bottom-0 left-[var(--sidebar-width-icon)] right-0 z-50';

  // In contexts without sidebar (like fullscreen), use simple fixed positioning
  const finalInputPositionClass = sidebarState ? inputPositionClass : 'fixed bottom-0 left-0 right-0 z-50';

  if (!hasConversation) {
    // Show Perplexity-inspired empty state with transparent background
    return (
      <div className="flex flex-col flex-1 min-h-0 w-full relative bg-transparent">
        <div className="flex-1 min-h-0 overflow-hidden">
          <PerplexityEmptyState onSendMessage={onSendMessage} />
        </div>
      </div>
    );
  }

  // Show conversation with sticky input bar
  return (
    <div className="flex flex-col flex-1 min-h-0 w-full relative bg-background/10 backdrop-blur-sm">
      {/* Chat Messages Area - full height with bottom padding for sticky input */}
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
          {/* Bottom spacer to prevent content from being hidden behind sticky input */}
          <div className="h-32" />
        </ScrollArea>
      </div>

      {/* Sticky Input Bar - Fixed to bottom of viewport */}
      <div className={finalInputPositionClass}>
        <div className="bg-background/95 backdrop-blur-sm border-t border-border/50 px-6 py-4 shadow-lg">
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
