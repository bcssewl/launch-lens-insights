
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
}

const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isTyping,
  viewportRef,
  onSendMessage
}) => {
  const hasConversation = messages.length > 1 || isTyping;

  if (!hasConversation) {
    // Enhanced glass empty state
    return (
      <div className="flex flex-col flex-1 min-h-0 w-full relative">
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full bg-background/10 backdrop-blur-sm rounded-xl border border-white/5">
            <PerplexityEmptyState onSendMessage={onSendMessage} />
          </div>
        </div>
      </div>
    );
  }

  // Enhanced glass conversation layout
  return (
    <div className="flex flex-col flex-1 min-h-0 w-full relative">
      {/* Glass chat messages container */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full bg-background/5 backdrop-blur-sm rounded-xl border border-white/5 overflow-hidden">
          <ScrollArea className="h-full w-full" viewportRef={viewportRef}>
            <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={{ ...msg, timestamp: formatTimestamp(msg.timestamp) }} />
              ))}
              {isTyping && <TypingIndicator />}
            </div>
            <div className="h-24" /> {/* Spacer for input */}
          </ScrollArea>
        </div>
      </div>

      {/* Enhanced glass input area */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <div className="bg-background/80 backdrop-blur-xl border-t border-white/10 shadow-2xl">
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
