import React, { useState } from 'react';
import { Globe, ChevronRight, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { RainbowText } from '../RainbowText';
import { FavIcon } from '../FavIcon';
import { ToolCall } from '@/stores/deerFlowMessageStore';
import ReactMarkdown from 'react-markdown';

interface CrawlToolCallProps {
  toolCall: ToolCall;
}

// Simple page cache for titles
const __pageCache = new Map<string, string>();

export const CrawlToolCall: React.FC<CrawlToolCallProps> = ({ toolCall }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const url = (toolCall.args as { url: string })?.url || '';
  const isCrawling = !toolCall.result && toolCall.status === 'running';
  
  // Try to extract title from result or use cached title
  const getPageTitle = () => {
    if (toolCall.result) {
      // Try to extract title from markdown content
      const titleMatch = toolCall.result.match(/^#\s+(.+)$/m);
      if (titleMatch) {
        return titleMatch[1];
      }
    }
    return __pageCache.get(url) || "Page Content";
  };

  const title = getPageTitle();

  return (
    <section className="mt-4 pl-4">
      <div className="font-medium italic flex items-center">
        <RainbowText animated={isCrawling}>
          <div className="flex items-center">
            <Globe size={16} className="mr-2" />
            <span>Crawling </span>
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:no-underline text-primary mx-1 flex items-center gap-1"
            >
              <FavIcon url={url} size={14} />
              {title}
            </a>
          </div>
        </RainbowText>
      </div>
      
      {toolCall.result && (
        <div className="mt-2 pr-4">
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              View extracted content
            </CollapsibleTrigger>
            <CollapsibleContent className="overflow-hidden">
              <div className="mt-2 max-h-60 overflow-y-auto rounded-md border border-border p-3 text-sm bg-card prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-base font-semibold mb-2">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-sm font-medium mb-1">{children}</h3>,
                    p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="text-sm">{children}</li>,
                    a: ({ href, children }) => (
                      <a 
                        href={href} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {children}
                      </a>
                    ),
                    code: ({ children }) => (
                      <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">
                        {children}
                      </code>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-muted-foreground/20 pl-4 italic mb-2">
                        {children}
                      </blockquote>
                    )
                  }}
                >
                  {toolCall.result}
                </ReactMarkdown>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
      
      {toolCall.error && (
        <div className="mt-2 pr-4 p-3 rounded-md border border-destructive/20 bg-destructive/5">
          <div className="text-sm text-destructive font-medium mb-1">Crawl Failed</div>
          <div className="text-xs text-destructive/80">{toolCall.error}</div>
        </div>
      )}
    </section>
  );
};