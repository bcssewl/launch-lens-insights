/**
 * @file ToolExecutionDisplay.tsx
 * @description Visual display for tool call execution status and results
 */

import React from 'react';
import { ToolCall } from '@/stores/deerFlowMessageStore';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Search, 
  Code, 
  Globe, 
  FileText, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface ToolExecutionDisplayProps {
  toolCalls: ToolCall[];
  isStreaming?: boolean;
}

const getToolIcon = (toolName: string | undefined) => {
  if (!toolName) return FileText;
  const name = toolName.toLowerCase();
  if (name.includes('search') || name.includes('web')) return Search;
  if (name.includes('code') || name.includes('python')) return Code;
  if (name.includes('visit') || name.includes('url')) return Globe;
  return FileText;
};

const getToolStatus = (toolCall: ToolCall) => {
  if (toolCall.error) return 'error';
  if (toolCall.result) return 'completed';
  if (toolCall.name && Object.keys(toolCall.args).length > 0) return 'running';
  return 'pending';
};

export const ToolExecutionDisplay: React.FC<ToolExecutionDisplayProps> = ({
  toolCalls,
  isStreaming = false
}) => {
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());

  if (toolCalls.length === 0) {
    return null;
  }

  const toggleExpanded = (toolId: string) => {
    const newExpanded = new Set(expandedTools);
    if (newExpanded.has(toolId)) {
      newExpanded.delete(toolId);
    } else {
      newExpanded.add(toolId);
    }
    setExpandedTools(newExpanded);
  };

  return (
    <div className="mb-4 space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="outline" className="text-xs">
          Tool Executions
        </Badge>
        <span className="text-xs text-muted-foreground">
          {toolCalls.length} tool{toolCalls.length !== 1 ? 's' : ''}
        </span>
      </div>

      {toolCalls.map((toolCall) => {
        const status = getToolStatus(toolCall);
        const IconComponent = getToolIcon(toolCall.name);
        const isExpanded = expandedTools.has(toolCall.id);
        const hasDetails = toolCall.result || toolCall.error || Object.keys(toolCall.args).length > 0;

        return (
          <Card key={toolCall.id} className="p-3 bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <IconComponent className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {toolCall.name || 'Unknown Tool'}
                  </span>
                </div>

                {/* Status indicator */}
                <div className="flex items-center gap-1">
                  {status === 'pending' && (
                    <div className="h-2 w-2 rounded-full bg-gray-400" />
                  )}
                  {status === 'running' && (
                    <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />
                  )}
                  {status === 'completed' && (
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                  )}
                  {status === 'error' && (
                    <XCircle className="h-3 w-3 text-red-500" />
                  )}
                  <Badge variant={
                    status === 'completed' ? 'default' :
                    status === 'error' ? 'destructive' :
                    status === 'running' ? 'secondary' : 'outline'
                  } className="text-xs capitalize">
                    {status}
                  </Badge>
                </div>
              </div>

              {/* Expand/collapse button */}
              {hasDetails && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpanded(toolCall.id)}
                  className="h-6 w-6 p-0"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </Button>
              )}
            </div>

            {/* Expandable details */}
            {hasDetails && (
              <Collapsible open={isExpanded}>
                <CollapsibleContent className="mt-3 space-y-2">
                  {/* Tool arguments */}
                  {Object.keys(toolCall.args).length > 0 && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Arguments:</div>
                      <div className="bg-background/50 rounded p-2 text-xs font-mono">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(toolCall.args, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Tool result */}
                  {toolCall.result && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Result:</div>
                      <div className="bg-background/50 rounded p-2 text-xs">
                        <pre className="whitespace-pre-wrap">
                          {typeof toolCall.result === 'string' 
                            ? toolCall.result 
                            : JSON.stringify(toolCall.result, null, 2)
                          }
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Tool error */}
                  {toolCall.error && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Error:</div>
                      <div className="bg-destructive/10 border border-destructive/20 rounded p-2 text-xs text-destructive">
                        {toolCall.error}
                      </div>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            )}
          </Card>
        );
      })}
    </div>
  );
};