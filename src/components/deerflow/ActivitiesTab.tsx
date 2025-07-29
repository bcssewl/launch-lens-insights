import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
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
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { useToast } from '@/hooks/use-toast';

interface ActivitiesTabProps {
  researchId: string;
}

// Tool type configurations with proper theming
const TOOL_CONFIGS = {
  'web_search': {
    label: 'Web Search',
    icon: Search,
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-700 dark:text-blue-300',
    badgeColor: 'bg-blue-500'
  },
  'crawl_tool': {
    label: 'Web Crawl',
    icon: Globe,
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    borderColor: 'border-green-200 dark:border-green-800',
    textColor: 'text-green-700 dark:text-green-300',
    badgeColor: 'bg-green-500'
  },
  'python_repl_tool': {
    label: 'Python Code',
    icon: Code,
    bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
    textColor: 'text-orange-700 dark:text-orange-300',
    badgeColor: 'bg-orange-500'
  },
  'local_search_tool': {
    label: 'Knowledge Search',
    icon: Database,
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    textColor: 'text-purple-700 dark:text-purple-300',
    badgeColor: 'bg-purple-500'
  }
};

const StatusBadge = ({ status }: { status?: string }) => {
  switch (status) {
    case 'running':
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Running
        </Badge>
      );
    case 'completed':
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    case 'error':
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-300">
          <XCircle className="w-3 h-3 mr-1" />
          Error
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-300">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
  }
};

const ToolCallCard = ({ toolCall, config }: { toolCall: ToolCall; config: any }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();
  const IconComponent = config.icon;

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied to clipboard',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Failed to copy',
        variant: 'destructive',
        duration: 2000,
      });
    }
  };

  const renderToolContent = () => {
    if (!toolCall.result && !toolCall.args) return null;

    switch (toolCall.name) {
      case 'web_search':
        return (
          <div className="space-y-3">
            {toolCall.args?.query && (
              <div className="p-3 bg-muted/50 rounded-md">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Search Query:</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(toolCall.args.query)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-sm mt-1">{toolCall.args.query}</p>
              </div>
            )}
            {toolCall.result?.results && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Search Results:</p>
                {toolCall.result.results.slice(0, 5).map((result: any, index: number) => (
                  <div key={index} className="p-3 bg-muted/30 rounded-md">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">{result.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{result.url}</p>
                        {result.snippet && (
                          <p className="text-xs mt-2 line-clamp-2">{result.snippet}</p>
                        )}
                      </div>
                      {result.url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a href={result.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'crawl_tool':
        return (
          <div className="space-y-3">
            {toolCall.args?.url && (
              <div className="p-3 bg-muted/50 rounded-md">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Target URL:</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                  >
                    <a href={toolCall.args.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                </div>
                <p className="text-sm mt-1 truncate">{toolCall.args.url}</p>
              </div>
            )}
            {toolCall.result?.content && (
              <div className="p-3 bg-muted/30 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Extracted Content:</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(toolCall.result.content)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <div className="text-xs max-h-32 overflow-y-auto prose prose-sm dark:prose-invert">
                  <ReactMarkdown>
                    {toolCall.result.content.slice(0, 500) + (toolCall.result.content.length > 500 ? '...' : '')}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        );

      case 'python_repl_tool':
        return (
          <div className="space-y-3">
            {toolCall.args?.code && (
              <div className="p-3 bg-muted/50 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Code:</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(toolCall.args.code)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <pre className="text-xs bg-black/5 dark:bg-white/5 p-2 rounded overflow-x-auto">
                  <code>{toolCall.args.code}</code>
                </pre>
              </div>
            )}
            {toolCall.result?.output && (
              <div className="p-3 bg-muted/30 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Output:</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(toolCall.result.output)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <pre className="text-xs bg-black/5 dark:bg-white/5 p-2 rounded overflow-x-auto max-h-32 overflow-y-auto">
                  <code>{toolCall.result.output}</code>
                </pre>
              </div>
            )}
          </div>
        );

      case 'local_search_tool':
        return (
          <div className="space-y-3">
            {toolCall.args?.query && (
              <div className="p-3 bg-muted/50 rounded-md">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Knowledge Query:</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(toolCall.args.query)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-sm mt-1">{toolCall.args.query}</p>
              </div>
            )}
            {toolCall.result?.results && (
              <div className="p-3 bg-muted/30 rounded-md">
                <p className="text-sm font-medium mb-2">Knowledge Base Results:</p>
                <div className="text-xs max-h-32 overflow-y-auto">
                  <pre className="text-xs bg-black/5 dark:bg-white/5 p-2 rounded overflow-x-auto">
                    <code>{JSON.stringify(toolCall.result.results, null, 2)}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="p-3 bg-muted/30 rounded-md">
            <p className="text-sm font-medium mb-2">Tool Data:</p>
            <pre className="text-xs bg-black/5 dark:bg-white/5 p-2 rounded overflow-x-auto max-h-32 overflow-y-auto">
              <code>{JSON.stringify({ args: toolCall.args, result: toolCall.result }, null, 2)}</code>
            </pre>
          </div>
        );
    }
  };

  return (
    <Card className={cn(
      "border rounded-lg transition-all duration-200",
      config.bgColor,
      config.borderColor,
      "hover:shadow-md"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconComponent className={cn("w-5 h-5", config.textColor)} />
            <div className="flex flex-col">
              <span className="font-medium text-sm">{config.label}</span>
              {toolCall.args?.query && (
                <span className="text-xs text-muted-foreground truncate max-w-48">
                  {toolCall.args.query}
                </span>
              )}
            </div>
            <StatusBadge status={toolCall.status} />
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="hover:bg-transparent"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      <Collapsible open={isExpanded}>
        <CollapsibleContent className="pb-4">
          <CardContent className="pt-0">
            {renderToolContent()}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export const ActivitiesTab = ({ researchId }: ActivitiesTabProps) => {
  const { researchActivityIds, getMessage } = useDeerFlowMessageStore();
  
  // Get research activity messages using correct mapping logic
  const activityToolCalls = useMemo(() => {
    if (!researchId) return [];
    
    // Get activity message IDs for this research session
    const activityIds = researchActivityIds.get(researchId) || [];
    
    // Get all tool calls from activity messages (excluding the planner message)
    const allToolCalls: ToolCall[] = [];
    
    activityIds.forEach((messageId, index) => {
      // Skip first message (planner) - index 0
      if (index === 0) return;
      
      const message = getMessage(messageId);
      if (message?.toolCalls) {
        allToolCalls.push(...message.toolCalls);
      }
    });
    
    // Sort by timestamp for chronological order
    return allToolCalls.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
  }, [researchId, researchActivityIds, getMessage]);

  // Group tool calls by type
  const groupedToolCalls = useMemo(() => {
    const groups: Record<string, ToolCall[]> = {};
    
    activityToolCalls.forEach(toolCall => {
      const toolType = toolCall.name || 'unknown';
      if (!groups[toolType]) {
        groups[toolType] = [];
      }
      groups[toolType].push(toolCall);
    });
    
    return groups;
  }, [activityToolCalls]);

  if (activityToolCalls.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-center">
        <div>
          <Database className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Activities Yet</h3>
          <p className="text-sm text-muted-foreground">
            Research activities will appear here as they execute
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Research Activities</h3>
          <Badge variant="secondary" className="text-xs">
            {activityToolCalls.length} {activityToolCalls.length === 1 ? 'activity' : 'activities'}
          </Badge>
        </div>
        
        <div className="space-y-3">
          {Object.entries(groupedToolCalls).map(([toolType, toolCalls]) => {
            const config = TOOL_CONFIGS[toolType as keyof typeof TOOL_CONFIGS] || {
              label: toolType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              icon: Code,
              bgColor: 'bg-gray-50 dark:bg-gray-950/20',
              borderColor: 'border-gray-200 dark:border-gray-800',
              textColor: 'text-gray-700 dark:text-gray-300',
              badgeColor: 'bg-gray-500'
            };
            
            return (
              <div key={toolType} className="space-y-2">
                {toolCalls.map((toolCall, index) => (
                  <ToolCallCard
                    key={`${toolCall.id || toolType}-${index}`}
                    toolCall={toolCall}
                    config={config}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
};