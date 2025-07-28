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
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <ScrollArea ref={scrollAreaRef} className="h-full w-full">
      <div className="p-4">
        {messages.length === 0 ? (
          <ConversationStarter onSendMessage={onSendMessage} />
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((message) => (
              <MessageItem key={message.id} message={message} />
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  );
};