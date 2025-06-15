
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessage from '@/components/assistant/ChatMessage';
import TypingIndicator from '@/components/assistant/TypingIndicator';
import ChatEmptyState from '@/components/assistant/ChatEmptyState';
import ChatInput from '@/components/assistant/ChatInput';
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
  return (
    <div className="flex flex-col flex-1 min-h-0 w-full relative">
      {/* Chat Messages Area */}
      <div className="flex-1 min-h-0 overflow-hidden mx-4 bg-background/30 backdrop-blur-xl border border-border/50 border-t-0 rounded-b-3xl relative">
        <ScrollArea className="h-full w-full" viewportRef={viewportRef}>
          <div className="p-6 space-y-6 flex flex-col items-stretch min-h-full transition-all duration-150">
            {messages.length <= 1 && !isTyping ? (
              <ChatEmptyState />
            ) : (
              <>
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={{ ...msg, timestamp: formatTimestamp(msg.timestamp) }} />
                ))}
                {isTyping && <TypingIndicator />}
              </>
            )}
          </div>
          <div className="absolute left-0 top-0 w-full h-6 pointer-events-none z-10 bg-gradient-to-b from-background/90 via-background/80 to-transparent" />
          <div className="absolute left-0 bottom-0 w-full h-10 pointer-events-none z-10 bg-gradient-to-t from-background/95 via-background/60 to-transparent" />
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="p-4">
        <ChatInput onSendMessage={onSendMessage} isTyping={isTyping} />
      </div>
    </div>
  );
};

// Helper function moved from constants
const formatTimestamp = (timestamp: Date): string => {
  return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default ChatArea;
