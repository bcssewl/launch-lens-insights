import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Play, Download, Check, X, Brain } from "lucide-react";
import { useState } from "react";
import { DeerMessage } from "@/stores/deerFlowStore";
import UserAvatar from "@/components/assistant/UserAvatar";
import AIAvatar from "@/components/assistant/AIAvatar";

interface MessageItemProps {
  message: DeerMessage;
}

export const MessageItem = ({ message }: MessageItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const renderMessageContent = () => {
    switch (message.role) {
      case 'user':
        return <UserMessage content={message.content} />;
      
      case 'assistant':
        return <AssistantMessage content={message.content} />;
      
      case 'planner':
        return <PlannerMessage message={message} />;
      
      case 'podcast':
        return <PodcastMessage message={message} />;
      
      case 'research':
        return <ResearchMessage message={message} />;
      
      default:
        return <div className="text-muted-foreground">Unknown message type</div>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
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

const PlannerMessage = ({ message }: { message: DeerMessage }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { title, thought, steps, reasoningContent } = message.metadata || {};

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
            {/* Deep Thinking Section */}
            {reasoningContent && (
              <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                <CollapsibleTrigger className="flex items-center space-x-2 w-full mb-3">
                  <Brain className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Deep Thinking
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-blue-600" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-blue-600" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="bg-blue-100/50 dark:bg-blue-900/20 rounded-lg p-3 mb-4 text-sm">
                    {reasoningContent}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Plan Content */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">
                {parsedContent.title || title || "Research Plan"}
              </h3>
              
              {(parsedContent.thought || thought) && (
                <p className="text-sm text-muted-foreground">
                  {parsedContent.thought || thought}
                </p>
              )}

              {(parsedContent.steps || steps) && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Steps:</h4>
                  <ol className="list-decimal list-inside space-y-1">
                    {(parsedContent.steps || steps).map((step: string, index: number) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <div className="flex space-x-2 pt-2">
                <Button size="sm" variant="default">
                  <Check className="h-4 w-4 mr-1" />
                  Accept
                </Button>
                <Button size="sm" variant="outline">
                  <X className="h-4 w-4 mr-1" />
                  Decline
                </Button>
              </div>
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
  const { researchState } = message.metadata || {};
  
  const getStateInfo = (state: string) => {
    switch (state) {
      case 'researching':
        return { label: 'Researching', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' };
      case 'generating_report':
        return { label: 'Generating Report', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' };
      case 'report_generated':
        return { label: 'Report Generated', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' };
      default:
        return { label: 'Processing', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300' };
    }
  };

  const stateInfo = getStateInfo(researchState || 'processing');

  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-start space-x-3 max-w-[80%]">
        <AIAvatar className="w-8 h-8" />
        <Card className="w-full border-purple-200 bg-purple-50/50 dark:bg-purple-950/20 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Research Summary</h3>
                <Badge className={stateInfo.color}>
                  {stateInfo.label}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {message.content}
              </p>
              
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  Open Research Panel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};