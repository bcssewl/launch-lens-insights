
import React from 'react';
import { cn } from '@/lib/utils';
import AIAvatar from './AIAvatar';
import UserAvatar from './UserAvatar';
import CopyButton from './CopyButton';
import MarkdownRenderer from './MarkdownRenderer';
import { isReportMessage, getReportPreview } from '@/utils/reportDetection';

export interface ChatMessageData {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  timestamp: string;
}

interface ChatMessageProps {
  message: ChatMessageData;
  onOpenCanvas?: (messageId: string, content: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onOpenCanvas }) => {
  const isAi = message.sender === 'ai';
  const isReport = isAi && isReportMessage(message.text);

  return (
    <div
      className={cn(
        "flex items-start gap-3 w-full transition-all duration-150",
        isAi ? "justify-start" : "justify-end"
      )}
      style={{
        width: '100%',
      }}
    >
      {isAi && (
        <AIAvatar className="w-8 h-8 flex-shrink-0 mt-1" />
      )}

      <div className={cn("flex flex-col", isAi ? "items-start" : "items-end")}>
        <div
          className={cn(
            "group relative shadow-md transition-all duration-200",
            'max-w-[90vw] sm:max-w-[80vw] md:max-w-xl lg:max-w-2xl xl:max-w-3xl',
            "p-3 rounded-2xl",
            isAi 
              ? "bg-muted text-foreground rounded-tl-sm border border-border shadow-lg"
              : "bg-primary text-primary-foreground rounded-tr-sm border border-primary/30"
          )}
        >
          {isAi && (
            <div className="absolute top-2 right-2">
              <CopyButton content={message.text} />
            </div>
          )}

          <div className={cn("text-sm leading-relaxed", isAi && "pr-8")}>
            {isAi ? (
              <>
                {isReport ? (
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground font-medium">
                      📊 Comprehensive Report Generated
                    </div>
                    <p className="text-sm opacity-80">
                      {getReportPreview(message.text)}
                    </p>
                    <p className="text-xs text-muted-foreground italic">
                      Report opened in preview window →
                    </p>
                  </div>
                ) : (
                  <MarkdownRenderer content={message.text} />
                )}
              </>
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
        <UserAvatar className="h-8 w-8 flex-shrink-0 mt-1" />
      )}
    </div>
  );
};

export default ChatMessage;
