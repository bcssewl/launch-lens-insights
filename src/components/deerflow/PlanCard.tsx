import { useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DeerMessage, useMessage } from '@/stores/deerFlowMessageStore';
import { motion } from 'motion/react';
import { parseJSON } from '@/lib/parseJSON';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

const GREETINGS = [
  "Cool", 
  "Sounds great", 
  "Looks good", 
  "Great", 
  "Awesome"
];

interface PlanData {
  title?: string;
  thought?: string;
  steps?: { 
    title?: string; 
    description?: string; 
  }[];
}

interface InterruptMessage {
  options?: { value: string; text: string }[];
}

interface PlanCardProps {
  messageId: string;
  interruptMessage?: InterruptMessage | null;
  onSendMessage?: (message: string, options?: { interruptFeedback?: string }) => void;
  waitForFeedback?: boolean;
  onFeedback?: (feedback: { option: { text: string; value: string } }) => void;
}

// Enhanced Markdown component that handles animated text streaming
const Markdown = ({ children, animated, className, isThinking = false }: { 
  children?: string; 
  animated?: boolean; 
  className?: string;
  isThinking?: boolean;
}) => {
  if (!children) return null;
  
  // For thinking content, preserve line breaks and use simple formatting
  if (isThinking) {
    const lines = children.split('\n');
    
    return (
      <div 
        className={cn(
          "text-sm leading-relaxed whitespace-pre-wrap",
          animated ? "text-primary" : "text-foreground",
          className
        )}
      >
        {lines.map((line, index) => (
          <div key={index} className="mb-1">
            {line || '\u00A0'} {/* Non-breaking space for empty lines */}
          </div>
        ))}
      </div>
    );
  }
  
  // For plan content, process markdown but maintain purple when streaming
  const processedContent = children
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mb-2">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  return (
    <div 
      className={cn(
        "prose dark:prose-invert max-w-none",
        animated && "text-primary prose-headings:text-primary prose-strong:text-primary",
        className
      )}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
};

// Simple loading animation component
const LoadingAnimation = ({ className }: { className?: string }) => (
  <div className={cn("flex space-x-1", className)}>
    <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
    <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
    <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
  </div>
);

// ThoughtBlock component matching DeerFlow exactly
const ThoughtBlock = ({ 
  content, 
  isStreaming, 
  hasMainContent 
}: { 
  content: string; 
  isStreaming?: boolean; 
  hasMainContent?: boolean; 
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [hasAutoCollapsed, setHasAutoCollapsed] = useState(false);

  useEffect(() => {
    if (hasMainContent && !hasAutoCollapsed) {
      setIsOpen(false);
      setHasAutoCollapsed(true);
    }
  }, [hasMainContent, hasAutoCollapsed]);

  if (!content || content.trim() === "") {
    return null;
  }

  return (
    <div className="mb-6 w-full">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "h-auto w-full justify-start rounded-xl border px-6 py-4 text-left transition-all duration-200",
              "hover:bg-accent hover:text-accent-foreground",
              isStreaming
                ? "border-primary/20 bg-primary/5 shadow-sm"
                : "border-border bg-card",
            )}
          >
            <div className="flex w-full items-center gap-3">
              <Lightbulb
                size={18}
                className={cn(
                  "shrink-0 transition-colors duration-200",
                  isStreaming ? "text-primary" : "text-muted-foreground",
                )}
              />
              <span
                className={cn(
                  "leading-none font-semibold transition-colors duration-200",
                  isStreaming ? "text-primary" : "text-foreground",
                )}
              >
                Deep Thinking
              </span>
              {isStreaming && <LoadingAnimation className="ml-2 scale-75" />}
              <div className="flex-grow" />
              {isOpen ? (
                <ChevronDown
                  size={16}
                  className="text-muted-foreground transition-transform duration-200"
                />
              ) : (
                <ChevronRight
                  size={16}
                  className="text-muted-foreground transition-transform duration-200"
                />
              )}
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-up-2 data-[state=open]:slide-down-2 mt-3">
          <Card
            className={cn(
              "transition-all duration-200",
              isStreaming ? "border-primary/20 bg-primary/5" : "border-border",
            )}
          >
            <CardContent>
              <div className="flex h-40 w-full overflow-y-auto">
                <ScrollArea className="h-full w-full">
                  <Markdown
                    className={cn(
                      "transition-colors duration-200 p-4",
                      isStreaming ? "text-primary" : "opacity-80",
                    )}
                    animated={isStreaming}
                    isThinking={true}
                  >
                    {content}
                  </Markdown>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export const PlanCard = ({ messageId, interruptMessage, onSendMessage, waitForFeedback, onFeedback }: PlanCardProps) => {
  // Use reactive message hook for live updates
  const message = useMessage(messageId);
  
  // Return early if message not found
  if (!message) {
    return null;
  }

  const plan = useMemo<PlanData>(() => {
    return parseJSON(message.content ?? "", {});
  }, [message.content]);

  const reasoningContent = message.reasoningContent;
  const hasMainContent = Boolean(
    message.content && message.content.trim() !== "",
  );

  // Judge if thinking: has reasoning content but main content is empty or just getting started
  const isThinking = Boolean(reasoningContent && !hasMainContent);

  // Show plan if we have main content (same as DeerFlow)
  const shouldShowPlan = hasMainContent;

  // Debug logging
  // Debug logging - reduced to prevent excessive console spam
  if (process.env.NODE_ENV === 'development' && Math.random() < 0.01) { // Only log 1% of renders
    console.log('🧠 PlanCard render (reactive):', {
      messageId,
      hasReasoningContent: Boolean(reasoningContent),
      hasMainContent,
      isThinking,
      shouldShowPlan,
      isStreaming: message.isStreaming,
      reasoningLength: reasoningContent?.length,
      contentLength: message.content?.length,
      reasoningContent: reasoningContent?.substring(0, 50) + (reasoningContent?.length > 50 ? '...' : ''),
      interruptMessage: interruptMessage ? {
        hasOptions: Boolean(interruptMessage.options?.length),
        optionsCount: interruptMessage.options?.length || 0,
        fullOptions: interruptMessage.options
      } : 'NO_INTERRUPT_MESSAGE',
      waitForFeedback,
      buttonConditions: {
        notStreaming: !message.isStreaming,
        hasInterruptOptions: Boolean(interruptMessage?.options?.length),
        shouldShowButtons: !message.isStreaming && Boolean(interruptMessage?.options?.length)
      }
    });
  }

  const handleAccept = useCallback(async () => {
    console.log('🚀 handleAccept called - Starting research');
    if (onSendMessage) {
      const greeting = `${GREETINGS[Math.floor(Math.random() * GREETINGS.length)]}! ${Math.random() > 0.5 ? "Let's get started." : "Let's start."}`;
      console.log('🚀 Sending acceptance message:', greeting);
      onSendMessage(greeting, {
        interruptFeedback: "accepted",
      });
    }
  }, [onSendMessage]);

  return (
    <div className={cn("w-full")}>
      {reasoningContent && (
        <ThoughtBlock
          content={reasoningContent}
          isStreaming={isThinking}
          hasMainContent={hasMainContent}
        />
      )}
      {shouldShowPlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Card className="w-full">
            <CardHeader>
              <CardTitle className={cn(
                "transition-colors duration-200",
                message.isStreaming && "text-primary"
              )}>
                <Markdown animated={message.isStreaming} isThinking={false}>
                  {`### ${
                    plan.title !== undefined && plan.title !== ""
                      ? plan.title
                      : "Deep Research"
                  }`}
                </Markdown>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Markdown 
                className={cn(
                  "mb-4",
                  message.isStreaming ? "text-primary" : "opacity-80"
                )}
                animated={message.isStreaming}
                isThinking={false}
              >
                {plan.thought}
              </Markdown>
              {plan.steps && (
                <ul className="my-2 flex list-decimal flex-col gap-4 border-l-[2px] pl-8">
                  {plan.steps.map((step, i) => (
                    <li key={`step-${i}`}>
                      <h3 className={cn(
                        "mb text-lg font-medium",
                        message.isStreaming && "text-primary"
                      )}>
                        <Markdown animated={message.isStreaming} isThinking={false}>
                          {step.title}
                        </Markdown>
                      </h3>
                      <div className={cn(
                        "text-sm",
                        message.isStreaming ? "text-primary/80" : "text-muted-foreground"
                      )}>
                        <Markdown animated={message.isStreaming} isThinking={false}>
                          {step.description}
                        </Markdown>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              {!message.isStreaming && interruptMessage?.options?.length && (
                <motion.div
                  className="flex gap-2"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  {interruptMessage.options.map((option) => (
                    <Button
                      key={option.value}
                      variant={
                        option.value === "accepted" ? "default" : "outline"
                      }
                      disabled={!waitForFeedback}
                      onClick={() => {
                        if (option.value === "accepted") {
                          void handleAccept();
                        } else {
                          onFeedback?.({
                            option,
                          });
                        }
                      }}
                    >
                      {option.text}
                    </Button>
                  ))}
                </motion.div>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </div>
  );
};