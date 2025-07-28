import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Play, Download, Check, X, Brain, Search, Link, Cog, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";
import { DeerMessage } from "@/stores/deerFlowStore";
import UserAvatar from "@/components/assistant/UserAvatar";
import AIAvatar from "@/components/assistant/AIAvatar";
import { useStreamingChat } from "@/hooks/useStreamingChat";

interface MessageItemProps {
  message: DeerMessage;
}

interface PlannerMessageProps {
  message: DeerMessage;
  onFeedback: (feedback: string) => void;
}

export const MessageItem = ({ message }: MessageItemProps) => {
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

const PlannerMessage = ({ message, onFeedback }: PlannerMessageProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isToolCallsExpanded, setIsToolCallsExpanded] = useState(false);
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

  const hasThinkingData = thinkingPhases.length > 0 || reasoningSteps.length > 0 || reasoningContent;
  const hasToolCalls = toolCalls.length > 0;
  const hasActivities = searchActivities.length > 0 || visitedUrls.length > 0;

  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-start space-x-3 max-w-[90%]">
        <AIAvatar className="w-8 h-8" />
        <Card className="w-full border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800">
          <CardContent className="p-4">
            {/* Deep Thinking Section */}
            {hasThinkingData && (
              <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                <CollapsibleTrigger className="flex items-center justify-between w-full mb-3 p-2 rounded-lg hover:bg-blue-100/50 dark:hover:bg-blue-900/30">
                  <div className="flex items-center space-x-2">
                    <Brain className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Deep Thinking
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {(thinkingPhases.length + reasoningSteps.length) || 1}
                    </Badge>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-blue-600" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-blue-600" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="bg-blue-100/50 dark:bg-blue-900/20 rounded-lg p-3 mb-4 space-y-3">
                    {/* Thinking Phases */}
                    {thinkingPhases.map((phase, index) => (
                      <div key={index} className="border-l-2 border-blue-300 pl-3">
                        <div className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
                          {phase.phase}
                        </div>
                        <div className="text-sm text-muted-foreground">{phase.content}</div>
                      </div>
                    ))}

                    {/* Reasoning Steps */}
                    {reasoningSteps.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300">Reasoning Steps:</h4>
                        <ol className="space-y-2">
                          {reasoningSteps.map((step, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="text-xs font-medium text-blue-600">{step.step}</div>
                                <div className="text-sm text-muted-foreground">{step.content}</div>
                              </div>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Legacy reasoning content */}
                    {reasoningContent && !reasoningSteps.length && (
                      <div className="text-sm text-muted-foreground">{reasoningContent}</div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Tool Calls Section */}
            {hasToolCalls && (
              <Collapsible open={isToolCallsExpanded} onOpenChange={setIsToolCallsExpanded}>
                <CollapsibleTrigger className="flex items-center justify-between w-full mb-3 p-2 rounded-lg hover:bg-purple-100/50 dark:hover:bg-purple-900/30">
                  <div className="flex items-center space-x-2">
                    <Cog className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                      Tool Executions
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {toolCalls.length}
                    </Badge>
                  </div>
                  {isToolCallsExpanded ? (
                    <ChevronUp className="h-4 w-4 text-purple-600" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-purple-600" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="bg-purple-100/50 dark:bg-purple-900/20 rounded-lg p-3 mb-4 space-y-3">
                    {toolCalls.map((toolCall, index) => (
                      <div key={toolCall.id || index} className="border border-purple-200 dark:border-purple-700 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                              {toolCall.name || 'Unknown Tool'}
                            </span>
                            {toolCall.result && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                            {toolCall.error && (
                              <X className="h-4 w-4 text-red-500" />
                            )}
                            {!toolCall.result && !toolCall.error && (
                              <Clock className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                        </div>
                        
                        {/* Tool Arguments */}
                        {toolCall.args && Object.keys(toolCall.args).length > 0 && (
                          <div className="mb-2">
                            <div className="text-xs font-medium text-muted-foreground mb-1">Arguments:</div>
                            <pre className="text-xs bg-muted rounded p-2 overflow-x-auto">
                              {JSON.stringify(toolCall.args, null, 2)}
                            </pre>
                          </div>
                        )}

                        {/* Tool Result */}
                        {toolCall.result && (
                          <div>
                            <div className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">Result:</div>
                            <div className="text-sm text-muted-foreground bg-green-50 dark:bg-green-900/20 rounded p-2">
                              {typeof toolCall.result === 'string' 
                                ? toolCall.result 
                                : JSON.stringify(toolCall.result, null, 2)}
                            </div>
                          </div>
                        )}

                        {/* Tool Error */}
                        {toolCall.error && (
                          <div>
                            <div className="text-xs font-medium text-red-700 dark:text-red-300 mb-1">Error:</div>
                            <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded p-2">
                              {toolCall.error}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Research Activities */}
            {hasActivities && (
              <div className="mb-4 p-3 bg-emerald-100/50 dark:bg-emerald-900/20 rounded-lg">
                <h4 className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-2 flex items-center">
                  <Search className="h-4 w-4 mr-1" />
                  Research Activities
                </h4>
                <div className="space-y-2">
                  {searchActivities.map((search, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <Search className="h-3 w-3 text-emerald-600" />
                      <span className="text-muted-foreground">Searched:</span>
                      <span className="font-medium">{search.query}</span>
                      {search.results && (
                        <Badge variant="outline" className="text-xs">
                          {search.results.length} results
                        </Badge>
                      )}
                    </div>
                  ))}
                  {visitedUrls.map((visit, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <Link className="h-3 w-3 text-emerald-600" />
                      <span className="text-muted-foreground">Visited:</span>
                      <span className="font-medium truncate">{visit.title || visit.url}</span>
                    </div>
                  ))}
                </div>
              </div>
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

              {/* Show interrupt options if available */}
              {options && options.length > 0 && (
                <div className="flex space-x-2 pt-2">
                  {options.map((option, index) => (
                    <Button
                      key={index}
                      size="sm"
                      variant={option.value === 'accepted' ? 'default' : 'outline'}
                      onClick={() => onFeedback(option.value)}
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