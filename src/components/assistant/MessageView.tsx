import React from 'react';
import { Button } from '@/components/ui/button';
import MarkdownRenderer from './MarkdownRenderer';
import { Message } from '@/types/chat';
import { cn } from '@/lib/utils';

interface MessageViewProps {
  message: Message;
  onFeedback: (value: string) => void;
  className?: string;
  isStreaming?: boolean;
}

const MessageView: React.FC<MessageViewProps> = ({
  message,
  onFeedback,
  className,
  isStreaming = false
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Message Content */}
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <MarkdownRenderer content={message.content} />
      </div>

      {/* Feedback Buttons */}
      {message.finishReason === 'interrupt' && message.options && message.options.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/20">
          {message.options.map((option, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => onFeedback(option.value)}
              className="transition-all duration-200 hover:bg-primary/10 hover:border-primary/30"
            >
              {option.title}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageView;