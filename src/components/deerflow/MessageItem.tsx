/**
 * @file MessageItem.tsx
 * @description Enhanced message item component with full DeerFlow event support
 */

import React from 'react';
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Download, Check, X } from "lucide-react";
import { DeerMessage } from "@/stores/deerFlowStore";
import UserAvatar from "@/components/assistant/UserAvatar";
import AIAvatar from "@/components/assistant/AIAvatar";
import { useStreamingChat } from "@/hooks/useStreamingChat";
import { DeepThinkingSection } from './DeepThinkingSection';
import { ToolExecutionDisplay } from './ToolExecutionDisplay';
import { ResearchActivitiesDisplay } from './ResearchActivitiesDisplay';
import { ReportGenerationProgress } from './ReportGenerationProgress';

interface MessageItemProps {
  message: DeerMessage;
  'aria-posinset'?: number;
  'aria-setsize'?: number;
  className?: string;
}

interface PlannerMessageProps {
  message: DeerMessage;
  onFeedback: (feedback: string) => void;
}

export const MessageItem = ({ message, 'aria-posinset': ariaPosinset, 'aria-setsize': ariaSetsize, className = '' }: MessageItemProps) => {
  const { sendFeedback } = useStreamingChat();

  const handleFeedback = (feedback: string) => {
    sendFeedback(feedback);
  };

  const renderMessageContent = () => {
    const agent = message.metadata?.agent;
    
    switch (message.role) {
      case 'user':
        return <UserMessage content={message.content} />;
      
      case 'assistant':
        // Determine message type based on agent
        if (agent === 'planner') {
          return <PlannerMessage message={message} onFeedback={handleFeedback} />;
        } else if (agent === 'reporter') {
          return <ResearchMessage message={message} />;
        } else if (message.metadata?.audioUrl) {
          return <PodcastMessage message={message} />;
        }
        return <AssistantMessage content={message.content} />;
      
      default:
        return <div className="text-muted-foreground">Unknown message type</div>;
    }
  };

  const getMessageTypeDescription = (): string => {
    const agent = message.metadata?.agent;
    
    if (message.role === 'user') return 'User message';
    if (agent === 'planner') return 'AI Planner response with research plan';
    if (agent === 'reporter') return 'AI Reporter response with research findings';
    if (message.metadata?.audioUrl) return 'AI generated podcast audio';
    
    return 'AI Assistant response';
  };

  const messageTypeDescription = getMessageTypeDescription();
  const timestamp = message.timestamp.toLocaleString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`w-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg ${className}`}
      role="article"
      aria-label={`${messageTypeDescription} from ${timestamp}`}
      aria-posinset={ariaPosinset}
      aria-setsize={ariaSetsize}
      tabIndex={0}
    >
      {/* Live region for streaming updates */}
      {message.isStreaming && (
        <div 
          aria-live="polite" 
          aria-atomic="false"
          className="sr-only"
        >
          {message.metadata?.agent === 'planner' ? 'Planning in progress' : 
           message.metadata?.agent === 'reporter' ? 'Generating report' : 
           'Response in progress'}
        </div>
      )}
      
      {renderMessageContent()}
    </motion.div>
  );
};

const UserMessage = ({ content }: { content: string }) => (
  <div className="flex justify-end mb-4">
    <div className="flex items-start space-x-3 max-w-[70%]">
      <div className="bg-primary text-primary-foreground rounded-2xl px-4 py-3 shadow-sm">
        <p className="text-sm leading-relaxed">{content}</p>
      </div>
      <UserAvatar className="w-8 h-8" />
    </div>
  </div>
);

const AssistantMessage = ({ content }: { content: string }) => (
  <div className="flex justify-start mb-4">
    <div className="flex items-start space-x-3 max-w-[80%]">
      <AIAvatar className="w-8 h-8" />
      <div className="bg-muted rounded-2xl px-4 py-3 shadow-sm">
        <p className="text-sm leading-relaxed">{content}</p>
      </div>
    </div>
  </div>
);

const PlannerMessage = ({ message, onFeedback }: PlannerMessageProps) => {
  const { 
    title, 
    thought, 
    steps, 
    reasoningContent,
    thinkingPhases = [],
    reasoningSteps = [],
    searchActivities = [],
    visitedUrls = []
  } = message.metadata || {};
  const options = message.options;
  const toolCalls = message.toolCalls || [];

  const parsedContent = (() => {
    try {
      return JSON.parse(message.content);
    } catch {
      return { title, thought, steps };
    }
  })();

  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-start space-x-3 max-w-[90%]">
        <AIAvatar className="w-8 h-8" />
        <Card className="w-full border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800">
          <CardContent className="p-4">
            {/* Agent indicator */}
            <Badge variant="outline" className="mb-2 text-xs">
              planner
            </Badge>

            {/* Deep Thinking Section for planner messages */}
            <DeepThinkingSection
              thinkingPhases={thinkingPhases}
              reasoningSteps={reasoningSteps}
              isStreaming={message.isStreaming}
            />

            {/* Tool Execution Display */}
            <ToolExecutionDisplay
              toolCalls={toolCalls}
              isStreaming={message.isStreaming}
            />

            {/* Research Activities Display */}
            <ResearchActivitiesDisplay
              searchActivities={searchActivities}
              visitedUrls={visitedUrls}
              isStreaming={message.isStreaming}
            />

            {/* Plan Content - Simplified for planner messages */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">
                {parsedContent.title || title || "Research Plan"}
              </h3>
              
              {(parsedContent.thought || thought) && (
                <p className="text-sm text-muted-foreground">
                  {parsedContent.thought || thought}
                </p>
              )}

              {/* Show only a summary for plan steps, detailed steps go to research panel */}
              {(parsedContent.steps || steps) && (
                <div className="text-sm text-muted-foreground">
                  <p>📋 Plan created with {(parsedContent.steps || steps).length} steps. View details in the Research Panel →</p>
                </div>
              )}

              {/* Legacy reasoning content fallback */}
              {reasoningContent && !reasoningSteps.length && !thinkingPhases.length && (
                <div className="text-sm text-muted-foreground bg-muted/50 rounded p-3">
                  {reasoningContent}
                </div>
              )}

              {/* Show interrupt options if available */}
              {options && options.length > 0 && (
                <div className="flex space-x-2 pt-2">
                  {options.map((option, index) => (
                    <Button
                      key={index}
                      size="sm"
                      variant={option.value === 'accepted' ? 'default' : 'outline'}
                      onClick={() => onFeedback?.(option.value)}
                    >
                      {option.value === 'accepted' ? (
                        <Check className="h-4 w-4 mr-1" />
                      ) : (
                        <X className="h-4 w-4 mr-1" />
                      )}
                      {option.text}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const PodcastMessage = ({ message }: { message: DeerMessage }) => {
  const { title, audioUrl } = message.metadata || {};
  
  const parsedContent = (() => {
    try {
      return JSON.parse(message.content);
    } catch {
      return { title, audioUrl };
    }
  })();

  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-start space-x-3 max-w-[80%]">
        <AIAvatar className="w-8 h-8" />
        <Card className="w-full border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Play className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">
                  {parsedContent.title || title || "Generated Podcast"}
                </h3>
              </div>
              
              {(parsedContent.audioUrl || audioUrl) && (
                <audio 
                  controls 
                  className="w-full"
                  src={parsedContent.audioUrl || audioUrl}
                >
                  Your browser does not support the audio element.
                </audio>
              )}
              
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ResearchMessage = ({ message }: { message: DeerMessage }) => {
  const { researchState, reportContent, citations } = message.metadata || {};

  const handleExport = (type: 'pdf' | 'copy') => {
    if (type === 'copy' && reportContent) {
      navigator.clipboard.writeText(reportContent);
    } else if (type === 'pdf') {
      // PDF export functionality would be implemented here
      console.log('PDF export requested');
    }
  };

  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-start space-x-3 max-w-[90%]">
        <AIAvatar className="w-8 h-8" />
        <div className="w-full space-y-3">
          {/* Report Generation Progress */}
          <ReportGenerationProgress
            researchState={researchState}
            reportContent={reportContent}
            citations={citations}
            isStreaming={message.isStreaming}
            onExport={handleExport}
          />
        </div>
      </div>
    </div>
  );
};