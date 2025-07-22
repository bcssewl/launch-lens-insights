import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Badge } from '../ui/badge';
import { ChevronDown, ChevronRight, Activity, Search, Code, ExternalLink, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { DeerStreamingState, DeerActivity } from '../../hooks/useDeerStreaming';
import MarkdownRenderer from './MarkdownRenderer';

interface DeerStreamingOverlayProps {
  streamingState: DeerStreamingState;
  className?: string;
  onRetry?: () => void;
}

const DeerStreamingOverlay: React.FC<DeerStreamingOverlayProps> = ({
  streamingState,
  className = '',
  onRetry
}) => {
  const [activitiesExpanded, setActivitiesExpanded] = useState(true);
  
  const { isStreaming, finalContent, activities, error, sources } = streamingState;

  // Don't show overlay if not streaming and no content
  if (!isStreaming && !finalContent && activities.length === 0 && !error) {
    return null;
  }

  const getToolIcon = (toolName: string) => {
    switch (toolName.toLowerCase()) {
      case 'tavily_search':
        return <Search className="h-4 w-4" />;
      case 'python':
      case 'code_interpreter':
        return <Code className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getToolDisplayName = (toolName: string) => {
    switch (toolName.toLowerCase()) {
      case 'tavily_search':
        return 'Web Search';
      case 'python':
        return 'Code Analysis';
      case 'code_interpreter':
        return 'Code Execution';
      default:
        return toolName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const formatActivityContent = (activity: DeerActivity) => {
    if (activity.toolName === 'tavily_search') {
      try {
        const results = JSON.parse(activity.content);
        if (Array.isArray(results)) {
          return `Found ${results.length} search results`;
        }
      } catch (e) {
        // Fallback to raw content
      }
    }
    
    // For other tools, show truncated content
    return activity.content.length > 100 
      ? activity.content.substring(0, 100) + '...'
      : activity.content;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Error State */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-destructive">Connection Error</span>
                </div>
                <p className="text-sm text-destructive/80 mb-3">{error}</p>
                {onRetry && (
                  <Button 
                    onClick={onRetry} 
                    variant="outline" 
                    size="sm"
                    className="border-destructive/20 text-destructive hover:bg-destructive/10"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activities Section */}
      {activities.length > 0 && (
        <Card className="border-primary/20">
          <Collapsible open={activitiesExpanded} onOpenChange={setActivitiesExpanded}>
            <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {activitiesExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">Activities</span>
                <Badge variant="secondary">{activities.length}</Badge>
                {isStreaming && (
                  <div className="flex items-center gap-1 text-primary">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs">Running</span>
                  </div>
                )}
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <CardContent className="pt-0 pb-4 space-y-2">
                {activities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getToolIcon(activity.toolName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {getToolDisplayName(activity.toolName)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {activity.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatActivityContent(activity)}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}

      {/* Sources Section */}
      {sources.length > 0 && (
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <ExternalLink className="h-4 w-4 text-primary" />
              <span className="font-medium">Sources</span>
              <Badge variant="secondary">{sources.length}</Badge>
            </div>
            <div className="space-y-2">
              {sources.map((source, index) => (
                <a
                  key={index}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors text-sm group"
                >
                  <ExternalLink className="h-3 w-3 flex-shrink-0 group-hover:text-primary" />
                  <span className="truncate group-hover:text-primary">
                    {source.title}
                  </span>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Final Content Section */}
      {finalContent && (
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="font-medium">Report</span>
              {isStreaming && (
                <Badge variant="outline" className="animate-pulse">
                  Writing...
                </Badge>
              )}
            </div>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <MarkdownRenderer content={finalContent} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Streaming Indicator */}
      {isStreaming && !error && (
        <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
          <div className="flex gap-1">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
          <span>Deer is thinking...</span>
        </div>
      )}
    </div>
  );
};

export default DeerStreamingOverlay;
