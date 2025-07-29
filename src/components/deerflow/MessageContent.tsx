/**
 * @file MessageContent.tsx
 * @description Message content component with platform's typography scale
 */

import { ToolCall } from '@/stores/deerFlowMessageStore';
import { ToolCallDisplay } from '@/components/assistant/ToolCallDisplay';
import { AnimatedMarkdown } from './AnimatedMarkdown';
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
        <AnimatedMarkdown 
          animated={false}
          checkLinkCredibility={true}
          className="max-w-none"
        >
          {content}
        </AnimatedMarkdown>
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