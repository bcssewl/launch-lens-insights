import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import MarkdownRenderer from '@/components/assistant/MarkdownRenderer';

interface ThoughtBlockProps {
  reasoning: string;
  isStreaming?: boolean;
  isVisible?: boolean;
  className?: string;
}

export const ThoughtBlock: React.FC<ThoughtBlockProps> = ({
  reasoning,
  isStreaming = false,
  isVisible = true,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isStreaming && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [reasoning, isStreaming]);

  if (!isVisible || !reasoning) {
    return null;
  }

  return (
    <Card className={cn(
      "border-primary/20 bg-primary/5 transition-all duration-300",
      isStreaming && "border-primary/40",
      className
    )}>
      <CardHeader className="pb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 w-fit p-2 h-auto"
        >
          <Brain className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Deep Thinking</span>
          {isStreaming && (
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          )}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div
            ref={contentRef}
            className={cn(
              "max-h-96 overflow-y-auto prose prose-sm max-w-none",
              "prose-headings:text-foreground prose-p:text-muted-foreground",
              "prose-strong:text-foreground prose-code:text-foreground",
              isStreaming && "animate-pulse"
            )}
          >
            <MarkdownRenderer content={reasoning} />
          </div>
        </CardContent>
      )}
    </Card>
  );
};