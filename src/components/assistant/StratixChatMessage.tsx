import React from 'react';
import { cn } from '@/lib/utils';
import AIAvatar from './AIAvatar';
import UserAvatar from './UserAvatar';
import CopyButton from './CopyButton';
import MarkdownRenderer from './MarkdownRenderer';
import CanvasCompact from './CanvasCompact';
import StratixProgressIndicator from './StratixProgressIndicator';
import { isReportMessage } from '@/utils/reportDetection';
import { StratixEvent } from '@/hooks/useStratixEventStream';

export interface StratixChatMessageData {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  timestamp: string;
  stratixProgress?: {
    status: string;
    events: StratixEvent[];
    isActive: boolean;
  };
}

interface StratixChatMessageProps {
  message: StratixChatMessageData;
  onOpenCanvas?: (messageId: string, content: string) => void;
  onCanvasDownload?: () => void;
  onCanvasPrint?: () => void;
}

const StratixChatMessage: React.FC<StratixChatMessageProps> = ({ 
  message, 
  onOpenCanvas,
  onCanvasDownload,
  onCanvasPrint
}) => {
  const isAi = message.sender === 'ai';
  const isReport = isAi && isReportMessage(message.text);
  const hasStratixProgress = message.stratixProgress && message.stratixProgress.isActive;

  const handleCanvasExpand = () => {
    if (onOpenCanvas) {
      onOpenCanvas(message.id, message.text);
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
        {/* Stratix Progress Indicator */}
        {hasStratixProgress && (
          <div className="w-full max-w-[90vw] sm:max-w-[80vw] md:max-w-xl lg:max-w-2xl xl:max-w-3xl mb-4">
            <div className="p-4 bg-muted/30 backdrop-blur-md border border-border/50 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-sm font-medium text-foreground">Stratix Research in Progress</span>
              </div>
              <StratixProgressIndicator
                status={message.stratixProgress.status}
                events={message.stratixProgress.events}
              />
            </div>
          </div>
        )}

        {/* Message Content */}
        <div
          className={cn(
            "group relative transition-all duration-200",
            'max-w-[90vw] sm:max-w-[80vw] md:max-w-xl lg:max-w-2xl xl:max-w-3xl',
            "p-3 rounded-2xl",
            isAi 
              ? "bg-white/10 backdrop-blur-md border border-white/20 text-foreground rounded-tl-sm shadow-glass hover:bg-white/15 hover:border-white/30"
              : "bg-primary/90 backdrop-blur-md border border-primary/30 text-primary-foreground rounded-tr-sm shadow-glass hover:bg-primary/95"
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
                  <CanvasCompact
                    content={message.text}
                    onExpand={handleCanvasExpand}
                    onDownload={onCanvasDownload}
                    onPrint={onCanvasPrint}
                  />
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

export default StratixChatMessage;