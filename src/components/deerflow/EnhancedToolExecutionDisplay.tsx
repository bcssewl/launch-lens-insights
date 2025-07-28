/**
 * @file EnhancedToolExecutionDisplay.tsx
 * @description Enhanced tool execution visualization for DeerFlow
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ChevronDown, 
  ChevronRight, 
  Search, 
  Globe, 
  Code, 
  Database,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ExternalLink,
  AlertTriangle
} from "lucide-react";
import { ToolCall } from "@/stores/deerFlowMessageStore";
import { isToolCallReadyForExecution, isToolCallComplete } from "@/utils/mergeMessage";

interface EnhancedToolExecutionDisplayProps {
  toolCalls: ToolCall[];
  isStreaming?: boolean;
  className?: string;
}

const TOOL_CONFIG = {
  'web-search': { 
    icon: Search, 
    color: 'text-blue-600', 
    bg: 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800',
    label: 'Web Search'
  },
  'github-search': { 
    icon: Search, 
    color: 'text-purple-600', 
    bg: 'bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-800',
    label: 'GitHub Search'
  },
  'crawl': { 
    icon: Globe, 
    color: 'text-green-600', 
    bg: 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800',
    label: 'Web Crawling'
  },
  'python': { 
    icon: Code, 
    color: 'text-yellow-600', 
    bg: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800',
    label: 'Python Execution'
  },
  'retriever': { 
    icon: Database, 
    color: 'text-indigo-600', 
    bg: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-800',
    label: 'Knowledge Retrieval'
  }
};

export const EnhancedToolExecutionDisplay = ({ 
  toolCalls, 
  isStreaming = false,
  className = ''
}: EnhancedToolExecutionDisplayProps) => {
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());

  if (!toolCalls || toolCalls.length === 0) return null;

  const toggleExpanded = (toolId: string) => {
    const newExpanded = new Set(expandedTools);
    if (newExpanded.has(toolId)) {
      newExpanded.delete(toolId);
    } else {
      newExpanded.add(toolId);
    }
    setExpandedTools(newExpanded);
  };

  const getToolConfig = (toolName: string) => {
    if (!toolName) return { 
      icon: Database, 
      color: 'text-gray-600', 
      bg: 'bg-gray-50 border-gray-200 dark:bg-gray-950/20 dark:border-gray-800',
      label: 'Unknown Tool' 
    };
    const name = toolName.toLowerCase();
    if (name.includes('search')) {
      return name.includes('github') ? TOOL_CONFIG['github-search'] : TOOL_CONFIG['web-search'];
    }
    if (name.includes('crawl') || name.includes('visit')) return TOOL_CONFIG['crawl'];
    if (name.includes('python') || name.includes('code')) return TOOL_CONFIG['python'];
    if (name.includes('retriev')) return TOOL_CONFIG['retriever'];
    
    return { 
      icon: Database, 
      color: 'text-gray-600', 
      bg: 'bg-gray-50 border-gray-200 dark:bg-gray-950/20 dark:border-gray-800',
      label: toolName 
    };
  };

  const getToolStatus = (toolCall: ToolCall) => {
    if (toolCall.error) return 'error';
    if (toolCall.result) return 'completed';
    if (isToolCallReadyForExecution(toolCall)) return 'executing';
    if (isToolCallComplete(toolCall)) return 'ready';
    return 'preparing';
  };

  const renderStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'executing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'ready':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'preparing':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const renderToolResult = (toolCall: ToolCall) => {
    if (toolCall.error) {
      return (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-950/20 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-300">
            <strong>Error:</strong> {toolCall.error}
          </p>
        </div>
      );
    }

    if (!toolCall.result) return null;

    const result = toolCall.result;

    // Handle search results
    if (result.results && Array.isArray(result.results)) {
      return (
        <div className="space-y-2">
          <p className="text-sm font-medium">Search Results ({result.results.length})</p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {result.results.slice(0, 3).map((item: any, index: number) => (
              <div key={index} className="p-2 bg-muted/30 rounded border">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h5 className="text-sm font-medium line-clamp-1">{item.title}</h5>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {item.snippet || item.description}
                    </p>
                  </div>
                  {item.url && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {result.results.length > 3 && (
              <p className="text-xs text-muted-foreground text-center">
                ... and {result.results.length - 3} more results
              </p>
            )}
          </div>
        </div>
      );
    }

    // Handle repositories
    if (result.repositories && Array.isArray(result.repositories)) {
      return (
        <div className="space-y-2">
          <p className="text-sm font-medium">Repositories ({result.repositories.length})</p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {result.repositories.slice(0, 3).map((repo: any, index: number) => (
              <div key={index} className="p-2 bg-muted/30 rounded border">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h5 className="text-sm font-medium">{repo.name}</h5>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {repo.description}
                    </p>
                    <Badge variant="secondary" className="text-xs mt-1">
                      ⭐ {repo.stars}
                    </Badge>
                  </div>
                  {repo.url && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={repo.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Handle content/output
    if (result.content || result.output) {
      return (
        <div className="p-3 bg-muted/30 rounded border">
          <pre className="text-xs whitespace-pre-wrap overflow-x-auto">
            {result.content || result.output}
          </pre>
        </div>
      );
    }

    // Generic JSON display
    return (
      <div className="p-3 bg-muted/30 rounded border">
        <pre className="text-xs whitespace-pre-wrap overflow-x-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center space-x-2">
        <Code className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Tool Execution</span>
        <Badge variant="outline" className="text-xs">
          {toolCalls.length} {toolCalls.length === 1 ? 'tool' : 'tools'}
        </Badge>
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {toolCalls.map((toolCall) => {
            const config = getToolConfig(toolCall.name);
            const status = getToolStatus(toolCall);
            const isExpanded = expandedTools.has(toolCall.id);
            const Icon = config.icon;

            return (
              <motion.div
                key={toolCall.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Collapsible 
                  open={isExpanded} 
                  onOpenChange={() => toggleExpanded(toolCall.id)}
                >
                  <Card className={`border ${config.bg} transition-all duration-200`}>
                    <CollapsibleTrigger asChild>
                      <CardContent className="p-3 cursor-pointer hover:bg-muted/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Icon className={`h-4 w-4 ${config.color}`} />
                            <span className="text-sm font-medium">{toolCall.name}</span>
                            {renderStatusIcon(status)}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {status}
                            </Badge>
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent className="px-3 pb-3 pt-0 space-y-3">
                        {/* Tool Arguments */}
                        {toolCall.args && Object.keys(toolCall.args).length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">Arguments:</p>
                            <div className="text-xs bg-muted p-2 rounded overflow-x-auto">
                              <pre>{JSON.stringify(toolCall.args, null, 2)}</pre>
                            </div>
                          </div>
                        )}

                        {/* Tool Result */}
                        {renderToolResult(toolCall)}

                        {/* Streaming indicator for args */}
                        {toolCall.argsChunks && toolCall.argsChunks.length > 0 && !isToolCallComplete(toolCall) && (
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>Receiving arguments... ({toolCall.argsChunks.length} chunks)</span>
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};