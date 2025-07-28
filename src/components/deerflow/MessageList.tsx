import React from "react";
import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDeerFlowStore } from "@/stores/deerFlowStore";
import { MessageItem } from "./MessageItem";
import { ConversationStarter } from "./ConversationStarter";

interface MessageListProps {
  onSendMessage?: (message: string) => void;
}

export const MessageList = ({ onSendMessage }: MessageListProps) => {
  const { messages } = useDeerFlowStore();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = (message: string) => {
    if (onSendMessage) {
      onSendMessage(message);
    }
  };

  return (
    <div className="h-full">
      <ScrollArea ref={scrollAreaRef} className="h-full px-4">
        <div className="py-4 pb-20">
          {messages.length === 0 ? (
            <ConversationStarter onSendMessage={handleSendMessage} />
          ) : (
            <div className="space-y-4 max-w-4xl mx-auto">
              {messages.map((message) => (
                <MessageItem key={message.id} message={message} />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};