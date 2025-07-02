
import React from 'react';
import { cn } from '@/lib/utils';
import AIAvatar from './AIAvatar';
import UserAvatar from './UserAvatar';
import CopyButton from './CopyButton';
import MarkdownRenderer from './MarkdownRenderer';
import CanvasCompact from './CanvasCompact';
import { isReportMessage, getReportPreview, generateCanvasAcknowledgment } from '@/utils/reportDetection';

export interface ChatMessageData {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  timestamp: string;
  isCanvasMessage?: boolean;
  canvasContent?: string;
  acknowledgment?: string;
}

interface ChatMessageProps {
  message: ChatMessageData;
  onOpenCanvas?: (messageId: string, content: string) => void;
  onCloseCanvas?: (messageId: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  onOpenCanvas,
  onCloseCanvas 
}) => {
  const isAi = message.sender === 'ai';
  const hasInlineCanvas = isAi && message.isCanvasMessage && message.canvasContent;

  const handleCanvasExpand = () => {
    if (onOpenCanvas && message.canvasContent) {
      onOpenCanvas(message.id, message.canvasContent);
    }
  };

  const handleCanvasClose = () => {
    if (onCloseCanvas) {
      onCloseCanvas(message.id);
    }
  };

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
              <CopyButton content={hasInlineCanvas ? message.canvasContent || '' : message.text} />
            </div>
          )}

          <div className={cn("text-sm leading-relaxed", isAi && "pr-8")}>
            {isAi ? (
              <>
                {hasInlineCanvas ? (
                  // Show acknowledgment for canvas messages
                  <p className="text-sm">
                    {message.acknowledgment || generateCanvasAcknowledgment(message.canvasContent || '')}
                  </p>
                ) : (
                  // Regular AI message
                  <MarkdownRenderer content={message.text} />
                )}
              </>
            ) : (
              <p className="whitespace-pre-wrap">{message.text}</p>
            )}
          </div>
        </div>

        {/* Inline Canvas - rendered below the message bubble */}
        {hasInlineCanvas && (
          <div className="mt-3 w-full max-w-[600px]">
            <CanvasCompact
              content={message.canvasContent || ''}
              title="AI Report"
              onExpand={handleCanvasExpand}
              onClose={handleCanvasClose}
            />
          </div>
        )}

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
