import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { RainbowText } from '../RainbowText';
import { FavIcon } from '../FavIcon';
import { ToolCall } from '@/stores/deerFlowMessageStore';

interface SearchResult {
  title: string;
  url: string;
  snippet?: string;
}

interface WebSearchToolCallProps {
  toolCall: ToolCall;
}

function parseJSON<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

export const WebSearchToolCall: React.FC<WebSearchToolCallProps> = ({ toolCall }) => {
  const searching = useMemo(() => toolCall.result === undefined, [toolCall.result]);
  
  const searchResults = useMemo(() => {
    try {
      return toolCall.result ? parseJSON<SearchResult[]>(toolCall.result, []) : undefined;
    } catch {
      return [];
    }
  }, [toolCall.result]);

  const query = (toolCall.args as { query: string })?.query || 'Unknown query';

  return (
    <section className="mt-4 pl-4">
      <div className="font-medium italic">
        <RainbowText animated={searching}>
          <Search size={16} className="mr-2" />
          <span>Searching for </span>
          <span className="max-w-[500px] overflow-hidden text-ellipsis whitespace-nowrap">
            {query}
          </span>
        </RainbowText>
      </div>
      
      <ul className="mt-2 flex flex-wrap gap-4">
        {searching && [...Array(6)].map((_, i) => (
          <li key={i} className="flex h-40 w-40 gap-2 rounded-md text-sm">
            <Skeleton 
              className="h-full w-full rounded-md bg-gradient-to-tl from-muted to-accent animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          </li>
        ))}
        
        {searchResults?.map((result, i) => (
          <motion.li
            key={i}
            className="bg-accent flex max-w-40 gap-2 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent/80 transition-colors"
            initial={{ opacity: 0, y: 10, scale: 0.66 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2, delay: i * 0.1, ease: "easeOut" }}
          >
            <FavIcon className="mt-1 flex-shrink-0" url={result.url} />
            <div className="flex-1 overflow-hidden">
              <div className="truncate font-medium text-foreground">{result.title}</div>
              <div className="text-xs opacity-75 truncate">{new URL(result.url).hostname}</div>
              {result.snippet && (
                <div className="text-xs opacity-60 line-clamp-2 mt-1">{result.snippet}</div>
              )}
            </div>
          </motion.li>
        ))}
      </ul>
    </section>
  );
};