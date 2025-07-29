/**
 * @file MessageContent.tsx
 * @description Message content component with platform's typography scale
 */

import ReactMarkdown from 'react-markdown';
import { ToolCall } from '@/stores/deerFlowMessageStore';
import { ToolCallDisplay } from '@/components/assistant/ToolCallDisplay';
import { cn } from '@/lib/utils';

interface MessageContentProps {
  content: string;
  agent?: string;
  toolCalls?: ToolCall[];
}

export const MessageContent = ({ content, agent, toolCalls }: MessageContentProps) => {
  return (
    <div className="space-y-4">
      {/* Main content with platform's prose styling */}
      {content && (
        <div className={cn(
          // Use platform's prose styling
          "prose prose-sm sm:prose-base",
          "dark:prose-invert",
          "prose-headings:text-foreground",
          "prose-p:text-foreground",
          "prose-strong:text-foreground",
          "prose-code:text-foreground",
          "prose-pre:bg-muted prose-pre:text-foreground",
          
          // Apply platform's link styling
          "prose-a:text-primary prose-a:decoration-primary/30",
          "hover:prose-a:decoration-primary/60",
          
          // Use platform's list styling
          "prose-ul:text-foreground prose-ol:text-foreground",
          "prose-li:text-foreground",
          
          // Override max-width to use full container
          "max-w-none"
        )}>
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      )}

      {/* Tool calls display */}
      {toolCalls && toolCalls.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Tool Executions</h4>
          <ToolCallDisplay toolCalls={toolCalls} />
        </div>
      )}
    </div>
  );
};