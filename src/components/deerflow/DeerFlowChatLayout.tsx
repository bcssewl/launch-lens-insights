import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings, Zap, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import ChatArea from '@/components/assistant/ChatArea';
import EnhancedChatInput from '@/components/assistant/EnhancedChatInput';
import { ThoughtBlock } from './ThoughtBlock';
import { PlanCard } from './PlanCard';
import { ResearchProgress } from './ResearchProgress';
import { SourcesPanel } from './SourcesPanel';
import { ReportRenderer } from './ReportRenderer';
import { useDeerStreaming, type DeerStreamingState } from '@/hooks/useDeerStreaming';
import type { DeerFlowChatRequest } from '@/services/deerflowService';

interface DeerFlowChatLayoutProps {
  messages: any[];
  isTyping?: boolean;
  onSendMessage: (message: string) => void;
  streamingState?: DeerStreamingState;
  className?: string;
}

export const DeerFlowChatLayout: React.FC<DeerFlowChatLayoutProps> = ({
  messages,
  isTyping = false,
  onSendMessage,
  streamingState: passedStreamingState,
  className
}) => {
  const { streamingState: internalStreamingState, startStreaming, stopStreaming, sendPlanFeedback } = useDeerStreaming();
  
  // Use passed streaming state if provided, otherwise use internal
  const streamingState = passedStreamingState || internalStreamingState;
  const [showSettings, setShowSettings] = useState(false);
  const [researchConfig, setResearchConfig] = useState<Partial<DeerFlowChatRequest>>({
    research_mode: 'general',
    max_plan_iterations: 3,
    max_step_num: 10,
    auto_accept_plan: true,
    thinking_on: true,
    research_only: false
  });
  
  const viewportRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async (message: string) => {
    try {
      console.log('🦌 DeerFlowChatLayout: Sending message via DeerFlow:', message);
      console.log('🦌 DeerFlowChatLayout: Config:', researchConfig);
      
      // Start DeerFlow streaming with current configuration
      await startStreaming(message, researchConfig);
      
      // Notify parent component
      onSendMessage(message);
    } catch (error) {
      console.error('❌ DeerFlow message error:', error);
    }
  };

  const handleConfigChange = (key: keyof DeerFlowChatRequest, value: any) => {
    setResearchConfig(prev => ({ ...prev, [key]: value }));
  };

  const handlePlanAccept = (feedback?: string) => {
    sendPlanFeedback(true, feedback);
  };

  const handlePlanReject = (feedback: string) => {
    sendPlanFeedback(false, feedback);
  };

  const handleDownloadReport = (format: 'pdf' | 'markdown' | 'word') => {
    console.log(`Downloading report as ${format}`);
    // Implementation for download functionality
  };

  const isStreaming = streamingState.isStreaming || isTyping;

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">DeerFlow Deep Research</h1>
              <p className="text-sm text-muted-foreground">
                Advanced AI research with multi-agent collaboration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </div>
        </div>

        {/* Research Configuration Panel */}
        {showSettings && (
          <Card className="m-4 border-primary/20">
            <CardHeader>
              <CardTitle className="text-base">Research Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Research Mode</Label>
                  <Select
                    value={researchConfig.research_mode}
                    onValueChange={(value) => handleConfigChange('research_mode', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Max Plan Iterations</Label>
                  <Select
                    value={researchConfig.max_plan_iterations?.toString()}
                    onValueChange={(value) => handleConfigChange('max_plan_iterations', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Max Research Steps</Label>
                  <Select
                    value={researchConfig.max_step_num?.toString()}
                    onValueChange={(value) => handleConfigChange('max_step_num', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="15">15</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-accept"
                    checked={researchConfig.auto_accept_plan}
                    onCheckedChange={(value) => handleConfigChange('auto_accept_plan', value)}
                  />
                  <Label htmlFor="auto-accept">Auto-accept plans</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="thinking-on"
                    checked={researchConfig.thinking_on}
                    onCheckedChange={(value) => handleConfigChange('thinking_on', value)}
                  />
                  <Label htmlFor="thinking-on">Show thinking process</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="research-only"
                    checked={researchConfig.research_only}
                    onCheckedChange={(value) => handleConfigChange('research_only', value)}
                  />
                  <Label htmlFor="research-only">Research only mode</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Chat */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden" ref={viewportRef}>
            <ChatArea
              messages={messages}
              isTyping={isStreaming}
              viewportRef={viewportRef}
              onSendMessage={handleSendMessage}
              selectedModel="deer"
            />
          </div>

          <div className="flex-shrink-0 border-t border-border bg-background p-4">
            <EnhancedChatInput
              onSendMessage={handleSendMessage}
              isTyping={isStreaming}
              selectedModel="deer"
            />
          </div>
        </div>

        {/* Right Panel - Research Components */}
        <div className="w-96 border-l border-border bg-background/50 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Research Progress */}
            {streamingState.isStreaming && (
              <ResearchProgress
                currentPhase={streamingState.currentPhase}
                overallProgress={streamingState.overallProgress}
                searchQueries={streamingState.searchQueries}
                sourcesFound={streamingState.sources.length}
              />
            )}

            {/* Thinking Process */}
            {researchConfig.thinking_on && streamingState.currentReasoning && (
              <ThoughtBlock
                reasoning={streamingState.currentReasoning}
                isStreaming={streamingState.isStreaming}
                isVisible={true}
              />
            )}

            {/* Research Plan */}
            {streamingState.currentPlan && (
              <PlanCard
                plan={streamingState.currentPlan.steps}
                isActive={streamingState.currentPlan.isActive}
                onAccept={handlePlanAccept}
                onReject={handlePlanReject}
                autoAccept={researchConfig.auto_accept_plan}
              />
            )}

            {/* Sources */}
            {streamingState.sources.length > 0 && (
            <SourcesPanel 
              sources={streamingState.sources.map(source => ({
                ...source,
                type: source.type as 'academic' | 'video' | 'image' | 'web' | 'pdf' | 'news'
              }))} 
              isCollapsible={true}
              maxVisible={5}
            />
            )}

            {/* Final Report */}
            {(streamingState.finalReport || streamingState.finalAnswer) && (
              <ReportRenderer
                content={streamingState.finalReport || streamingState.finalAnswer}
                title="Research Report"
                isComplete={streamingState.currentPhase === 'complete'}
                isStreaming={streamingState.isStreaming && streamingState.currentPhase === 'synthesizing'}
                onDownload={handleDownloadReport}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};