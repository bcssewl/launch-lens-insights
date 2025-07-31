/**
 * @file ResearchPanel.tsx
 * @description Research panel displaying tool calls grouped by type with real-time updates
 */

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useResearchPanel } from '@/hooks/useOptimizedMessages';
import { useDeerFlowMessageStore } from '@/stores/deerFlowMessageStore';
import { useStreamingChat } from '@/hooks/useStreamingChat';
import { ToolCall } from '@/stores/deerFlowMessageStore';
import { ActivitiesTab } from './ActivitiesTab';
import { ReportTab as NewReportTab } from './ReportTab';
import { 
  Search, 
  Globe, 
  Code, 
  Database, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2,
  X,
  ChevronDown,
  ChevronRight,
  Activity,
  FileText,
  Play,
  Copy,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

// Tool type configurations with Launch Lens design system colors
const TOOL_CONFIGS = {
  'web-search': {
    label: 'Web Searches',
    icon: Search,
    theme: 'blue',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-700 dark:text-blue-300',
    badgeColor: 'bg-blue-500'
  },
  'crawl': {
    label: 'Web Crawls',
    icon: Globe,
    theme: 'green',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    borderColor: 'border-green-200 dark:border-green-800',
    textColor: 'text-green-700 dark:text-green-300',
    badgeColor: 'bg-green-500'
  },
  'python': {
    label: 'Python Executions',
    icon: Code,
    theme: 'orange',
    bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
    textColor: 'text-orange-700 dark:text-orange-300',
    badgeColor: 'bg-orange-500'
  },
  'retriever': {
    label: 'Knowledge Retrievals',
    icon: Database,
    theme: 'purple',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    textColor: 'text-purple-700 dark:text-purple-300',
    badgeColor: 'bg-purple-500'
  }
} as const;

const getToolConfig = (toolName: string) => {
  // Map tool names to types
  if (toolName.includes('search') || toolName.includes('Search')) return TOOL_CONFIGS['web-search'];
  if (toolName.includes('crawl') || toolName.includes('Crawl')) return TOOL_CONFIGS['crawl'];
  if (toolName.includes('python') || toolName.includes('Python') || toolName.includes('code')) return TOOL_CONFIGS['python'];
  if (toolName.includes('retriever') || toolName.includes('Retriever') || toolName.includes('knowledge')) return TOOL_CONFIGS['retriever'];
  
  // Default to web search for unknown tools
  return TOOL_CONFIGS['web-search'];
};

interface ToolCallItemProps {
  toolCall: ToolCall;
  isExpanded: boolean;
  onToggle: () => void;
}

const ToolCallItem: React.FC<ToolCallItemProps> = ({ toolCall, isExpanded, onToggle }) => {
  const config = getToolConfig(toolCall.name);
  const IconComponent = config.icon;
  
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
    <Card className={cn(
      "transition-all duration-200",
      config.bgColor,
      config.borderColor,
      "border-l-4"
    )}>
      <CardHeader 
        className="pb-2 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full",
              "bg-background border border-border"
            )}>
              <IconComponent className={cn("w-4 h-4", config.textColor)} />
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
                {toolCall.timestamp && (
                  <span className="text-xs text-muted-foreground">
                    {new Date(toolCall.timestamp).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className={cn(config.badgeColor, "text-white text-xs")}
            >
              {config.label.split(' ')[0]}
            </Badge>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <Separator className="mb-4" />
          
          {/* Tool Arguments */}
          {toolCall.args && Object.keys(toolCall.args).length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2 text-foreground">Arguments:</h4>
              <div className="bg-muted/50 rounded-md p-3">
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                  {JSON.stringify(toolCall.args, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Tool Result */}
          {toolCall.result && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2 text-foreground">Result:</h4>
              <div className="bg-muted/50 rounded-md p-3">
                {typeof toolCall.result === 'string' ? (
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                    {toolCall.result}
                  </p>
                ) : (
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                    {JSON.stringify(toolCall.result, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}

          {/* Error Display */}
          {toolCall.error && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2 text-destructive">Error:</h4>
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                <p className="text-xs text-destructive">
                  {toolCall.error}
                </p>
              </div>
            </div>
          )}

          {/* Args Chunks (for streaming) */}
          {toolCall.argsChunks && toolCall.argsChunks.length > 0 && !toolCall.args && (
            <div>
              <h4 className="text-sm font-medium mb-2 text-foreground">Streaming Arguments:</h4>
              <div className="bg-muted/50 rounded-md p-3">
                <p className="text-xs text-muted-foreground">
                  {toolCall.argsChunks.join('')}
                  <span className="animate-pulse">|</span>
                </p>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

interface ToolCallsGroupProps {
  toolCalls: ToolCall[];
  expandedItems: Set<string>;
  onToggleExpand: (id: string) => void;
}

const ToolCallsGroup: React.FC<ToolCallsGroupProps> = ({ 
  toolCalls, 
  expandedItems, 
  onToggleExpand 
}) => {
  // Group tool calls by type
  const groupedToolCalls = useMemo(() => {
    const groups: Record<string, ToolCall[]> = {};
    
    toolCalls.forEach(toolCall => {
      const config = getToolConfig(toolCall.name);
      const groupKey = config.label;
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(toolCall);
    });
    
    return groups;
  }, [toolCalls]);

  if (toolCalls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Database className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No Research Activities</h3>
        <p className="text-sm text-muted-foreground">
          Research activities will appear here as the AI conducts its investigation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedToolCalls).map(([groupLabel, calls]) => {
        const config = Object.values(TOOL_CONFIGS).find(c => c.label === groupLabel) || TOOL_CONFIGS['web-search'];
        const IconComponent = config.icon;

        return (
          <div key={groupLabel}>
            <div className="flex items-center gap-3 mb-4">
              <div className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full",
                config.badgeColor
              )}>
                <IconComponent className="w-3 h-3 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                {groupLabel}
              </h3>
              <Badge variant="outline" className="text-xs">
                {calls.length}
              </Badge>
            </div>
            
            <div className="space-y-3 ml-9">
              {calls.map(toolCall => (
                <ToolCallItem
                  key={toolCall.id}
                  toolCall={toolCall}
                  isExpanded={expandedItems.has(toolCall.id)}
                  onToggle={() => onToggleExpand(toolCall.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};


export const ResearchPanel = () => {
  const { getMessagesByThread, getMessage } = useDeerFlowMessageStore();
  
  // Helper function to find reporter message for a research session
  const getReporterMessageId = (researchId: string): string | null => {
    const researchMessage = getMessage(researchId);
    if (!researchMessage?.threadId) return null;
    
    const threadMessages = getMessagesByThread(researchMessage.threadId);
    const reporterMessage = threadMessages.find(msg => msg.agent === 'reporter');
    
    return reporterMessage?.id || null;
  };
  const {
    isOpen: isResearchPanelOpen,
    activeTab: activeResearchTab,
    openResearchId,
    researchMessage,
    closeResearchPanel,
    switchTab
  } = useResearchPanel();
  
  const { generatePodcast } = useStreamingChat();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Extract tool calls from the research message
  const toolCalls = researchMessage?.toolCalls || [];

  const handleToggleExpand = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  if (!isResearchPanelOpen) return null;

  return (
    <Card className="h-full border-l bg-card flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b flex-shrink-0">
        <h3 className="text-lg font-semibold">Research Panel</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={closeResearchPanel}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex flex-col flex-1 min-h-0">
        <Tabs
          value={activeResearchTab}
          onValueChange={(tab) => switchTab(tab as "activities" | "report")}
          className="h-full flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-2 mx-4 mb-4 mt-4 flex-shrink-0">
            <TabsTrigger value="activities" className="flex items-center space-x-1">
              <Activity className="h-4 w-4" />
              <span>Activities ({toolCalls.length})</span>
            </TabsTrigger>
            <TabsTrigger value="report" className="flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span>Report</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent 
            value="activities" 
            className="h-full min-h-0 flex-grow overflow-hidden mx-4"
            forceMount
            hidden={activeResearchTab !== "activities"}
          >
            {openResearchId ? (
              <ScrollArea className="h-full">
                <ActivitiesTab researchId={openResearchId} />
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center h-64 text-center">
                <div>
                  <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Research Selected</h3>
                  <p className="text-sm text-muted-foreground">
                    Select a research session to view activities
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent 
            value="report" 
            className="h-full min-h-0 flex-grow overflow-hidden mx-4"
            forceMount
            hidden={activeResearchTab !== "report"}
          >
            {openResearchId ? (
              <ScrollArea className="h-full">
                <NewReportTab 
                  researchId={openResearchId} 
                />
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center h-64 text-center">
                <div>
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Research Selected</h3>
                  <p className="text-sm text-muted-foreground">
                    Select a research session to view the report
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};