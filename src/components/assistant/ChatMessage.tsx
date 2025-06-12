
import React from 'react';
import { cn } from '@/lib/utils';
import AIAvatar from './AIAvatar';
import UserAvatar from './UserAvatar';
import CopyButton from './CopyButton';
import MarkdownRenderer from './MarkdownRenderer';

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
    <div className={cn("flex items-start gap-3 w-full", isAi ? "justify-start" : "justify-end")}>
      {isAi && (
        <AIAvatar className="w-10 h-10 flex-shrink-0 mt-1" />
      )}
      
      <div className={cn("flex flex-col", isAi ? "items-start" : "items-end")}>
        <div
          className={cn(
            "group relative max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl shadow-sm",
            isAi 
              ? "bg-muted text-foreground rounded-tl-sm" 
              : "bg-primary text-primary-foreground rounded-tr-sm"
          )}
        >
          {isAi && (
            <div className="absolute top-2 right-2">
              <CopyButton content={message.text} />
            </div>
          )}
          
          <div className={cn("text-sm leading-relaxed", isAi && "pr-8")}>
            {isAi ? (
              <MarkdownRenderer content={message.text} />
            ) : (
              <p className="whitespace-pre-wrap">{message.text}</p>
            )}
          </div>
        </div>
        <p className={cn(
          "text-xs mt-1 opacity-70 px-1",
          isAi ? "text-muted-foreground" : "text-muted-foreground"
        )}>
          {message.timestamp}
        </p>
      </div>

      {!isAi && (
        <UserAvatar className="h-10 w-10 flex-shrink-0 mt-1" />
      )}
    </div>
  );
};

export default ChatMessage;
