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

  // Research configuration state with DeerFlow settings
  const [researchConfig, setResearchConfig] = useState<Partial<DeerFlowChatRequest>>({
    max_plan_iterations: 1,
    max_step_num: 3,
    max_search_results: 3,
    auto_accepted_plan: false,
    enable_background_investigation: true,
    report_style: 'academic',
    enable_deep_thinking: false,
    debug: false
  });

  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'markdown' | 'html'>('pdf');
  const messagesEndRef = useRef<HTMLDivElement>(null);
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

  // Auto-scroll to bottom when new content arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingState.finalAnswer, streamingState.thoughtSteps]);

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Header with Configuration */}
      <div className="border-b border-border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">DeerFlow Deep Research</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            >
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Button>
            
            {streamingState.finalAnswer && (
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            )}
          </div>
        </div>

        {/* Advanced Settings Panel */}
        {showAdvancedSettings && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Research Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="report-style">Report Style</Label>
                  <Select 
                    value={researchConfig.report_style || 'academic'}
                    onValueChange={(value) => handleConfigChange('report_style', value as 'academic' | 'popular_science' | 'news' | 'social_media')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="popular_science">Popular Science</SelectItem>
                      <SelectItem value="news">News</SelectItem>
                      <SelectItem value="social_media">Social Media</SelectItem>
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
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="15">15</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Max Search Results</Label>
                  <Select
                    value={researchConfig.max_search_results?.toString()}
                    onValueChange={(value) => handleConfigChange('max_search_results', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="15">15</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-accept"
                    checked={researchConfig.auto_accepted_plan}
                    onCheckedChange={(value) => handleConfigChange('auto_accepted_plan', value)}
                  />
                  <Label htmlFor="auto-accept">Auto-accept plans</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="deep-thinking"
                    checked={researchConfig.enable_deep_thinking}
                    onCheckedChange={(value) => handleConfigChange('enable_deep_thinking', value)}
                  />
                  <Label htmlFor="deep-thinking">Enable deep thinking</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="background-investigation"
                    checked={researchConfig.enable_background_investigation}
                    onCheckedChange={(value) => handleConfigChange('enable_background_investigation', value)}
                  />
                  <Label htmlFor="background-investigation">Background investigation</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="debug-mode"
                    checked={researchConfig.debug}
                    onCheckedChange={(value) => handleConfigChange('debug', value)}
                  />
                  <Label htmlFor="debug-mode">Debug mode</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Chat */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            <ChatArea 
              messages={messages} 
              isTyping={isTyping} 
              viewportRef={viewportRef}
              onSendMessage={handleSendMessage}
              selectedModel="deer"
            />
            
            {/* Research Progress */}
            {streamingState.isStreaming && (
              <div className="mt-4">
                <ResearchProgress
                  currentPhase={streamingState.currentPhase}
                  overallProgress={streamingState.overallProgress}
                  searchQueries={streamingState.searchQueries}
                  sourcesFound={streamingState.sources.length}
                />
              </div>
            )}

            {/* Thinking Process */}
            {streamingState.thoughtSteps.length > 0 && researchConfig.enable_deep_thinking && (
              <div className="mt-4">
                <ThoughtBlock
                  reasoning={streamingState.currentReasoning}
                  isStreaming={streamingState.isStreaming}
                  isVisible={streamingState.currentPhase === 'thinking'}
                />
              </div>
            )}

            {/* Plan Review */}
            {streamingState.currentPlan && streamingState.currentPlan.needsApproval && (
              <div className="mt-4">
                <PlanCard
                  plan={streamingState.currentPlan.steps}
                  isActive={true}
                  onAccept={(feedback) => sendPlanFeedback(true, feedback)}
                  onReject={(feedback) => sendPlanFeedback(false, feedback)}
                />
              </div>
            )}

            {/* Final Report */}
            {streamingState.finalAnswer && (
              <div className="mt-4">
                <ReportRenderer
                  content={streamingState.finalAnswer}
                  title="Research Report"
                  isComplete={streamingState.currentPhase === 'complete'}
                  isStreaming={streamingState.isStreaming}
                  onDownload={(format) => console.log('Download:', format)}
                  onShare={() => console.log('Share report')}
                  onEdit={() => console.log('Edit report')}
                />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
          
          <div className="border-t border-border p-4">
            <EnhancedChatInput
              onSendMessage={handleSendMessage}
              isTyping={streamingState.isStreaming}
              selectedModel="deer"
            />
          </div>
        </div>

        {/* Right Panel - Sources & Details */}
        {streamingState.sources.length > 0 && (
          <div className="w-80 border-l border-border overflow-y-auto">
            <div className="p-4">
              <SourcesPanel
                sources={streamingState.sources.map(source => ({
                  ...source,
                  type: source.type as 'academic' | 'pdf' | 'web' | 'video' | 'image' | 'news'
                }))}
                isCollapsible={true}
                maxVisible={5}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};