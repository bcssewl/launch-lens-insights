/**
 * @file ToolCallDisplay.tsx
 * @description Message-based tool call display matching Launch Lens platform design
 */

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Copy,
  Search,
  Globe,
  Code,
  Database,
  Activity,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { ToolCall } from "@/stores/deerFlowMessageStore";
import ReactMarkdown from "react-markdown";

interface ToolCallDisplayProps {
  toolCalls: ToolCall[];
  className?: string;
}

export const ToolCallDisplay = ({ toolCalls, className = "" }: ToolCallDisplayProps) => {
  if (!toolCalls || toolCalls.length === 0) {
    return (
      <div className={`text-center text-muted-foreground py-8 ${className}`}>
        <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No tool executions yet</p>
        <p className="text-sm">Tool calls will appear here during conversation</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {toolCalls.map((toolCall) => (
        <ToolCallCard key={toolCall.id} toolCall={toolCall} />
      ))}
    </div>
  );
};

interface ToolCallCardProps {
  toolCall: ToolCall;
}

const ToolCallCard = ({ toolCall }: ToolCallCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isArgsExpanded, setIsArgsExpanded] = useState(false);

  // Get tool type from name for icon selection
  const getToolType = (name: string): string => {
    if (name.includes('search') || name.includes('github')) return 'web-search';
    if (name.includes('crawl') || name.includes('visit')) return 'crawl';
    if (name.includes('python') || name.includes('code')) return 'python';
    if (name.includes('retriever')) return 'retriever';
    return 'generic';
  };

  const getToolIcon = (toolType: string) => {
    switch (toolType) {
      case "web-search":
        return <Search className="h-4 w-4" />;
      case "crawl":
        return <Globe className="h-4 w-4" />;
      case "python":
        return <Code className="h-4 w-4" />;
      case "retriever":
        return <Database className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusInfo = (toolCall: ToolCall) => {
    const hasResult = toolCall.result !== undefined && toolCall.result !== null;
    const hasError = !!toolCall.error;
    
    if (hasError) {
      return {
        status: 'error',
        icon: <AlertCircle className="h-4 w-4 text-destructive" />,
        badge: <Badge variant="destructive">Error</Badge>
      };
    }
    
    if (hasResult) {
      return {
        status: 'completed',
        icon: <CheckCircle className="h-4 w-4 text-emerald-500" />,
        badge: <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 border-emerald-200">Completed</Badge>
      };
    }
    
    // Still running if no result and no error
    return {
      status: 'running',
      icon: <Loader2 className="h-4 w-4 animate-spin text-blue-500" />,
      badge: <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-200">Running</Badge>
    };
  };

  const toolType = getToolType(toolCall.name);
  const toolIcon = getToolIcon(toolType);
  const statusInfo = getStatusInfo(toolCall);

  const handleCopyResult = () => {
    if (toolCall.result) {
      navigator.clipboard.writeText(JSON.stringify(toolCall.result, null, 2));
    }
  };

  const renderToolResult = () => {
    if (toolCall.error) {
      return (
        <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">Error</span>
          </div>
          <pre className="text-xs text-destructive bg-destructive/5 p-2 rounded overflow-x-auto">
            {toolCall.error}
          </pre>
        </div>
      );
    }

    if (!toolCall.result) {
      return (
        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            <span className="text-sm text-muted-foreground">Executing tool...</span>
          </div>
        </div>
      );
    }

    // Handle different result types based on tool type
    const result = toolCall.result;

    if (toolType === 'web-search' && Array.isArray(result)) {
      return (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Search Results ({result.length})</span>
            <Button variant="ghost" size="sm" onClick={handleCopyResult}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          {result.map((item: any, index: number) => (
            <Card key={index} className="border-muted/50">
              <CardContent className="p-3">
                <div className="flex gap-3">
                  {item.image_url && (
                    <img 
                      src={item.image_url} 
                      alt={item.title || 'Result image'}
                      className="w-12 h-12 rounded-md object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="font-medium text-sm line-clamp-2">{item.title || item.name}</h5>
                      {item.url && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={item.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {item.snippet || item.description}
                    </p>
                    {item.source && (
                      <Badge variant="outline" className="text-xs mt-2">
                        {item.source}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (toolType === 'python' && typeof result === 'string') {
      return (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Execution Output</span>
            <Button variant="ghost" size="sm" onClick={handleCopyResult}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto border">
            <code>{result}</code>
          </pre>
        </div>
      );
    }

    // Generic result display
    return (
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Result</span>
          <Button variant="ghost" size="sm" onClick={handleCopyResult}>
            <Copy className="h-3 w-3" />
          </Button>
        </div>
        <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto border">
          <code>{JSON.stringify(result, null, 2)}</code>
        </pre>
      </div>
    );
  };

  return (
    <Card className="border-muted/50 bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {toolIcon}
            <div>
              <h4 className="font-medium text-sm">{toolCall.name}</h4>
              <p className="text-xs text-muted-foreground">Tool execution</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {statusInfo.badge}
            {statusInfo.icon}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Tool Arguments */}
        {toolCall.args && Object.keys(toolCall.args).length > 0 && (
          <Collapsible open={isArgsExpanded} onOpenChange={setIsArgsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-start p-0 h-auto text-xs">
                {isArgsExpanded ? (
                  <ChevronDown className="h-3 w-3 mr-1" />
                ) : (
                  <ChevronRight className="h-3 w-3 mr-1" />
                )}
                Arguments
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <pre className="text-xs bg-muted/50 p-2 rounded border">
                {JSON.stringify(toolCall.args, null, 2)}
              </pre>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Tool Result */}
        {renderToolResult()}

        <Separator className="my-3" />
        
        {/* Timestamp */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Tool: {toolCall.name}</span>
          <span>{statusInfo.status}</span>
        </div>
      </CardContent>
    </Card>
  );
};