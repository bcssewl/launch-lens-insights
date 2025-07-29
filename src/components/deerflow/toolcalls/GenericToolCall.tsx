import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Settings, CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RainbowText } from '../RainbowText';
import { ToolCall } from '@/stores/deerFlowMessageStore';
import { cn } from '@/lib/utils';

interface GenericToolCallProps {
  toolCall: ToolCall;
}

export const GenericToolCall: React.FC<GenericToolCallProps> = ({ toolCall }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isRunning = toolCall.status === 'running' || (!toolCall.result && !toolCall.error);

  const getStatusIcon = () => {
    switch (toolCall.status) {
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (toolCall.status) {
      case 'running':
        return 'Running...';
      case 'completed':
        return 'Completed';
      case 'error':
        return 'Failed';
      default:
        return 'Pending';
    }
  };

  return (
    <section className="mt-4 pl-4">
      <div className="font-medium italic flex items-center">
        <RainbowText animated={isRunning}>
          <div className="flex items-center">
            <Settings size={16} className="mr-2" />
            <span>Executing {toolCall.name}</span>
          </div>
        </RainbowText>
      </div>

      <Card className="mt-2 mr-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background border border-border">
                <Settings className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-sm font-medium">
                  {toolCall.name}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon()}
                  <span className="text-xs text-muted-foreground">
                    {getStatusText()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          {/* Arguments */}
          {toolCall.args && Object.keys(toolCall.args).length > 0 && (
            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                View arguments
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 p-3 rounded-md border border-border bg-muted/50">
                  <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(toolCall.args, null, 2)}
                  </pre>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Result */}
          {toolCall.result && (
            <div>
              <div className="text-sm font-medium mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Result
              </div>
              <div className="p-3 rounded-md border border-border bg-card">
                <pre className="text-xs overflow-x-auto whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {typeof toolCall.result === 'string' 
                    ? toolCall.result 
                    : JSON.stringify(toolCall.result, null, 2)
                  }
                </pre>
              </div>
            </div>
          )}

          {/* Error */}
          {toolCall.error && (
            <div>
              <div className="text-sm font-medium mb-2 flex items-center gap-2 text-destructive">
                <XCircle className="w-4 h-4" />
                Error
              </div>
              <div className="p-3 rounded-md border border-destructive/20 bg-destructive/5">
                <pre className="text-xs text-destructive overflow-x-auto whitespace-pre-wrap">
                  {toolCall.error}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};