
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
    <div className={cn("flex items-start gap-4 w-full", isAi ? "justify-start" : "justify-end")}>
      {isAi && (
        <AIAvatar className="w-10 h-10 flex-shrink-0 mt-1" />
      )}
      
      <div className={cn("flex flex-col max-w-[80%] md:max-w-[70%]", isAi ? "items-start" : "items-end")}>
        <div
          className={cn(
            "group relative p-4 rounded-2xl shadow-sm backdrop-blur-sm border",
            isAi 
              ? "bg-card/80 border-border/50 text-foreground rounded-tl-md hover:bg-card/90" 
              : "bg-primary/90 border-primary/30 text-primary-foreground rounded-tr-md hover:bg-primary"
          )}
        >
          {isAi && (
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
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
          "text-xs mt-2 opacity-60 px-2",
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
