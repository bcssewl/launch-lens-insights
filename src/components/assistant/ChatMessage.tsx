
import React from 'react';
import { cn } from '@/lib/utils';
import AIAvatar from './AIAvatar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // For user avatar in future

export interface ChatMessageData {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  timestamp: string;
}

interface ChatMessageProps {
  message: ChatMessageData;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAi = message.sender === 'ai';

  return (
    <div className={cn("flex items-end space-x-3 py-2", isAi ? "justify-start" : "justify-end")}>
      {isAi && <AIAvatar className="self-start" />}
      <div
        className={cn(
          "max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl p-3 rounded-xl shadow-md",
          isAi ? "bg-primary text-primary-foreground rounded-bl-none" : "bg-muted text-foreground rounded-br-none"
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        <p className={cn("text-xs mt-1", isAi ? "text-primary-foreground/70" : "text-muted-foreground/70")}>
          {message.timestamp}
        </p>
      </div>
      {!isAi && (
        <Avatar className="h-10 w-10 self-start">
          <AvatarImage src="/placeholder.svg" alt="User Avatar" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default ChatMessage;
