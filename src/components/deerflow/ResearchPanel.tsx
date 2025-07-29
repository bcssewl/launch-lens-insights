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
import { WebSearchToolCall, PythonToolCall, CrawlToolCall, GenericToolCall } from './toolcalls';

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

// Rich tool call visualization component that routes to specialized visualizations
const RichToolCallItem: React.FC<{ toolCall: ToolCall }> = ({ toolCall }) => {
  const toolName = toolCall.name.toLowerCase();
  
  // Route to specialized visualizations based on tool type
  if (toolName.includes('search') || toolName.includes('web')) {
    return <WebSearchToolCall toolCall={toolCall} />;
  }
  
  if (toolName.includes('python') || toolName.includes('code')) {
    return <PythonToolCall toolCall={toolCall} />;
  }
  
  if (toolName.includes('crawl') || toolName.includes('scrape')) {
    return <CrawlToolCall toolCall={toolCall} />;
  }
  
  // Fallback to generic visualization for unknown tool types
  return <GenericToolCall toolCall={toolCall} />;
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
                <RichToolCallItem
                  key={toolCall.id}
                  toolCall={toolCall}
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
    <Card className="h-full border-l bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
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

      <CardContent className="p-0 h-full">
        <Tabs
          value={activeResearchTab}
          onValueChange={(tab) => switchTab(tab as "activities" | "report")}
          className="h-full flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-2 mx-4 mb-4 mt-4">
            <TabsTrigger value="activities" className="flex items-center space-x-1">
              <Activity className="h-4 w-4" />
              <span>Activities ({toolCalls.length})</span>
            </TabsTrigger>
            <TabsTrigger value="report" className="flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span>Report</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activities" className="flex-1">
            {openResearchId ? (
              <ActivitiesTab researchId={openResearchId} />
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

          <TabsContent value="report" className="flex-1">
            {openResearchId ? (
              <NewReportTab 
                researchId={openResearchId} 
              />
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