import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeerFlowMessageStore } from '@/stores/deerFlowMessageStore';
import { ToolCall } from '@/stores/deerFlowMessageStore';
import { 
  Search, 
  Globe, 
  Code, 
  Database, 
  ChevronDown, 
  ChevronRight,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Copy,
  ExternalLink,
  BookOpenText,
  FileText,
  PencilRuler
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'motion/react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';
import { Image } from './Image';
import { FavIcon } from './FavIcon';
import { LoadingAnimation } from './LoadingAnimation';

interface ActivitiesTabProps {
  researchId: string;
}

// DeerFlow-style components for exact parity
const RainbowText = ({ children, animated, className }: { children: React.ReactNode; animated?: boolean; className?: string }) => (
  <div className={cn("text-base font-medium italic", className, animated && "animate-pulse")}>
    {children}
  </div>
);

// Skeleton loading component for search results - matching DeerFlow exactly
const SearchResultSkeleton = ({ delay = 0 }: { delay?: number }) => (
  <li className="flex h-40 w-40 gap-2 rounded-md text-sm">
    <Skeleton
      className="h-full w-full rounded-md bg-gradient-to-tl from-slate-400 to-accent"
      style={{ animationDelay: `${delay * 0.2}s` }}
    />
  </li>
);

// Activity message component (content display)
const ActivityMessage = ({ messageId }: { messageId: string }) => {
  const { getMessage } = useDeerFlowMessageStore();
  const message = getMessage(messageId);
  
  if (message?.agent && message.content) {
    if (message.agent !== "reporter" && message.agent !== "planner") {
      return (
        <div className="px-4 py-2">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      );
    }
  }
  return null;
};

// Web search tool call component matching DeerFlow exactly
const WebSearchToolCall = ({ toolCall }: { toolCall: ToolCall }) => {
  const searching = !toolCall.result;
  
  const searchResults = useMemo(() => {
    if (!toolCall.result) return [];
    try {
      const results = typeof toolCall.result === 'string' 
        ? JSON.parse(toolCall.result) 
        : toolCall.result;
      return Array.isArray(results) ? results : (results.results || []);
    } catch {
      return [];
    }
  }, [toolCall.result]);

  const pageResults = searchResults.filter(result => result.type === "page" || result.title);
  const imageResults = searchResults.filter(result => result.type === "image" || result.image_url);

  return (
    <section className="mt-4 pl-4">
      <div className="font-medium italic">
        <RainbowText
          className="flex items-center"
          animated={searching}
        >
          <Search size={16} className="mr-2" />
          <span>Searching for&nbsp;</span>
          <span className="max-w-[500px] overflow-hidden text-ellipsis whitespace-nowrap">
            {(toolCall.args as { query: string }).query}
          </span>
        </RainbowText>
      </div>
      <div className="pr-4">
        {pageResults && (
          <ul className="mt-2 flex flex-wrap gap-4">
            {searching &&
              [...Array(6)].map((_, i) => (
                <SearchResultSkeleton key={`search-result-${i}`} delay={i} />
              ))}
            {pageResults
              .filter((result) => result.type === "page" || result.title)
              .map((searchResult, i) => (
                <motion.li
                  key={`search-result-${i}`}
                  className="text-muted-foreground bg-accent flex max-w-40 gap-2 rounded-md px-2 py-1 text-sm"
                  initial={{ opacity: 0, y: 10, scale: 0.66 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.2,
                    delay: i * 0.1,
                    ease: "easeOut",
                  }}
                >
                  <FavIcon
                    className="mt-1"
                    url={searchResult.url}
                    title={searchResult.title}
                  />
                  <a 
                    href={searchResult.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors h-full flex-grow overflow-hidden text-ellipsis whitespace-nowrap"
                  >
                    {searchResult.title}
                  </a>
                </motion.li>
              ))}
          </ul>
        )}
        {imageResults && imageResults.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-4">
            {imageResults.map((searchResult, i) => (
              <motion.li
                key={`image-result-${i}`}
                initial={{ opacity: 0, y: 10, scale: 0.66 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.2,
                  delay: i * 0.1,
                  ease: "easeOut",
                }}
              >
                <a
                  className="flex flex-col gap-2 overflow-hidden rounded-md opacity-75 transition-opacity duration-300 hover:opacity-100"
                  href={searchResult.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src={searchResult.image_url}
                    alt={searchResult.image_description || "Search result image"}
                    className="bg-accent h-40 w-40 max-w-full rounded-md"
                    imageClassName="hover:scale-110"
                    imageTransition
                    fallback="Image unavailable"
                  />
                </a>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

// Crawl tool call component matching DeerFlow exactly
const CrawlToolCall = ({ toolCall }: { toolCall: ToolCall }) => {
  const url = (toolCall.args as { url: string }).url;
  const title = toolCall.result?.title || url;
  
  return (
    <section className="mt-4 pl-4">
      <div>
        <RainbowText
          className="flex items-center text-base font-medium italic"
          animated={!toolCall.result}
        >
          <BookOpenText size={16} className="mr-2" />
          <span>Reading</span>
        </RainbowText>
      </div>
      <ul className="mt-2 flex flex-wrap gap-4">
        <motion.li
          className="text-muted-foreground bg-accent flex h-40 w-40 gap-2 rounded-md px-2 py-1 text-sm"
          initial={{ opacity: 0, y: 10, scale: 0.66 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.2,
            ease: "easeOut",
          }}
        >
          <FavIcon className="mt-1" url={url} title={title} />
          <a
            className="h-full flex-grow overflow-hidden text-ellipsis whitespace-nowrap hover:text-foreground transition-colors"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {title}
          </a>
        </motion.li>
      </ul>
    </section>
  );
};

// Python tool call component matching DeerFlow exactly
const PythonToolCall = ({ toolCall }: { toolCall: ToolCall }) => {
  const { resolvedTheme } = useTheme();
  
  return (
    <section className="mt-4 pl-4">
      <div className="w-fit overflow-y-auto rounded-md py-0">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <div className="flex items-center font-medium italic">
                <Code size={16} className="mr-2" />
                <RainbowText
                  className="pr-0.5 text-base font-medium italic"
                  animated={toolCall.result === undefined}
                >
                  Running Python code
                </RainbowText>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {toolCall.args?.code && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Code:</p>
                  <SyntaxHighlighter
                    language="python"
                    style={resolvedTheme === "dark" ? dark : docco}
                    customStyle={{
                      background: "transparent",
                      border: "none",
                      boxShadow: "none",
                    }}
                  >
                    {toolCall.args.code}
                  </SyntaxHighlighter>
                </div>
              )}
              {toolCall.result && (
                <div className="bg-accent max-h-[400px] max-w-[560px] overflow-y-auto rounded-md text-sm">
                  <SyntaxHighlighter
                    language="text"
                    style={resolvedTheme === "dark" ? dark : docco}
                    customStyle={{
                      background: "transparent",
                      border: "none",
                      boxShadow: "none",
                    }}
                  >
                    {typeof toolCall.result === 'string' ? toolCall.result.trim() : JSON.stringify(toolCall.result, null, 2)}
                  </SyntaxHighlighter>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
};

// Retriever tool call component
const RetrieverToolCall = ({ toolCall }: { toolCall: ToolCall }) => {
  const searching = !toolCall.result;
  
  const documents = useMemo(() => {
    return toolCall.result ? (Array.isArray(toolCall.result) ? toolCall.result : []) : [];
  }, [toolCall.result]);

  return (
    <section className="mt-4 pl-4">
      <div className="font-medium italic">
        <RainbowText className="flex items-center" animated={searching}>
          <Search size={16} className="mr-2" />
          <span>Retrieving documents&nbsp;</span>
          <span className="max-w-[500px] overflow-hidden text-ellipsis whitespace-nowrap">
            {(toolCall.args as { query: string }).query}
          </span>
        </RainbowText>
      </div>
      <div className="pr-4">
        <ul className="mt-2 flex flex-wrap gap-4">
          {searching &&
            [...Array(2)].map((_, i) => (
              <SearchResultSkeleton key={`search-result-${i}`} delay={i} />
            ))}
          {documents.map((doc: any, i: number) => (
            <motion.li
              key={`search-result-${i}`}
              className="text-muted-foreground bg-accent flex max-w-40 gap-2 rounded-md px-2 py-1 text-sm"
              initial={{ opacity: 0, y: 10, scale: 0.66 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.2,
                delay: i * 0.1,
                ease: "easeOut",
              }}
            >
              <FileText size={32} />
              {doc.title}
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
};

// MCP tool call component matching DeerFlow exactly
const MCPToolCall = ({ toolCall }: { toolCall: ToolCall }) => {
  const { resolvedTheme } = useTheme();
  
  return (
    <section className="mt-4 pl-4">
      <div className="w-fit overflow-y-auto rounded-md py-0">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <div className="flex items-center font-medium italic">
                <PencilRuler size={16} className="mr-2" />
                <RainbowText
                  className="pr-0.5 text-base font-medium italic"
                  animated={toolCall.result === undefined}
                >
                  Running {toolCall.name ? toolCall.name + "()" : "MCP tool"}
                </RainbowText>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {toolCall.result && (
                <div className="bg-accent max-h-[400px] max-w-[560px] overflow-y-auto rounded-md text-sm">
                  <SyntaxHighlighter
                    language="json"
                    style={resolvedTheme === "dark" ? dark : docco}
                    customStyle={{
                      background: "transparent",
                      border: "none",
                      boxShadow: "none",
                    }}
                  >
                    {typeof toolCall.result === 'string' ? toolCall.result.trim() : JSON.stringify(toolCall.result, null, 2)}
                  </SyntaxHighlighter>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
};

// Activity list item component (tool calls display) - matching DeerFlow structure
const ActivityListItem = ({ messageId }: { messageId: string }) => {
  const { getMessage } = useDeerFlowMessageStore();
  const message = getMessage(messageId);
  
  // Show tool calls even when streaming to display skeleton loaders like DeerFlow
  if (message && message.toolCalls?.length) {
    return (
      <>
        {message.toolCalls.map((toolCall) => {
          if (toolCall.name === "web_search") {
            return <WebSearchToolCall key={toolCall.id} toolCall={toolCall} />;
          } else if (toolCall.name === "crawl_tool") {
            return <CrawlToolCall key={toolCall.id} toolCall={toolCall} />;
          } else if (toolCall.name === "python_repl_tool") {
            return <PythonToolCall key={toolCall.id} toolCall={toolCall} />;
          } else if (toolCall.name === "local_search_tool") {
            return <RetrieverToolCall key={toolCall.id} toolCall={toolCall} />;
          } else {
            return <MCPToolCall key={toolCall.id} toolCall={toolCall} />;
          }
        })}
      </>
    );
  }
  return null;
};

// Main ActivitiesTab component using DeerFlow-style rendering
export const ActivitiesTab: React.FC<ActivitiesTabProps> = ({ researchId }) => {
  const { researchActivityIds, ongoingResearchId } = useDeerFlowMessageStore();
  
  const activityIds = researchActivityIds.get(researchId) || [];
  const ongoing = ongoingResearchId === researchId;
  
  if (activityIds.length === 0 && !ongoing) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No research activities yet.</p>
      </div>
    );
  }

  return (
    <>
      <ul className="flex flex-col py-4">
        {activityIds.map(
          (activityId, i) =>
            i !== 0 && (
              <motion.li
                key={activityId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
              >
                <ActivityMessage messageId={activityId} />
                <ActivityListItem messageId={activityId} />
                {i !== activityIds.length - 1 && <hr className="my-8" />}
              </motion.li>
            ),
        )}
      </ul>
      {ongoing && <LoadingAnimation className="mx-4 my-12" />}
    </>
  );
};

