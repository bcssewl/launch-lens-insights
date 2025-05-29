
import React from 'react';
import { cn } from '@/lib/utils';
import AIAvatar from './AIAvatar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
    <div className={cn("flex items-end space-x-3", isAi ? "justify-start" : "justify-end flex-row-reverse space-x-reverse")}>
      {isAi ? (
        <AIAvatar className="w-8 h-8 flex-shrink-0" />
      ) : (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src="/placeholder.svg" alt="User Avatar" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl shadow-sm",
          isAi 
            ? "bg-muted text-foreground rounded-bl-sm" 
            : "bg-primary text-primary-foreground rounded-br-sm"
        )}
      >
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
        <p className={cn(
          "text-xs mt-2 opacity-70",
          isAi ? "text-muted-foreground" : "text-primary-foreground"
        )}>
          {message.timestamp}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
