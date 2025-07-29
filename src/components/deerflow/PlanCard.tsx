import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Brain, Play, Loader2, Search, Settings, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { DeerMessage } from '@/stores/deerFlowMessageStore';
import { cn } from '@/lib/utils';
import { parse } from 'best-effort-json-parser';

// Greeting messages array matching original DeerFlow
const GREETINGS = [
  "Perfect",
  "Great", 
  "Excellent",
  "Sounds good",
  "Let's do this",
  "Awesome"
];

// Exact API data structures matching DeerFlow backend
interface Step {
  need_web_search: boolean;        // Note: API uses "need_web_search", not "need_search"
  title: string;
  description: string;
  step_type: "research" | "processing";
}

interface Plan {
  locale: string;                  // e.g. "en-US", "zh-CN"
  has_enough_context: boolean;
  thought: string;                 // Planner's reasoning about the task
  title: string;                   // Research plan title
  steps: Step[];                   // Array of research/processing steps
}

// Robust JSON parsing function from original DeerFlow
function parseJSON<T>(json: string | null | undefined, fallback: T): T {
  if (!json) {
    return fallback;
  }
  try {
    const raw = json
      .trim()
      .replace(/^```json\s*/, "")
      .replace(/^```js\s*/, "")
      .replace(/^```ts\s*/, "")
      .replace(/^```plaintext\s*/, "")
      .replace(/^```\s*/, "")
      .replace(/\s*```$/, "");
    return parse(raw) as T;
  } catch {
    return fallback;
  }
}

interface PlanCardProps {
  message: DeerMessage;
  onStartResearch?: (planId: string) => void;
  onSendMessage?: (message: string, options?: { interruptFeedback?: string }) => void; // ADD
  isExecuting?: boolean;
}

export const PlanCard = ({ message, onStartResearch, onSendMessage, isExecuting = false }: PlanCardProps) => {
  // Parse plan data using robust parseJSON function (matching original DeerFlow)
  const planData = useMemo(() => {
    return parseJSON<Plan>(message.content ?? "", {} as Plan);
  }, [message.content]);

  // Status tracking
  const [isCompleted, setIsCompleted] = useState(false);

  // Update completion status based on streaming
  useEffect(() => {
    setIsCompleted(!message.isStreaming && message.content.length > 0);
  }, [message.isStreaming, message.content.length]);

  // Validate plan structure (graceful degradation)
  const isValidPlan = planData && 
    typeof planData === 'object' && 
    ('steps' in planData || 'title' in planData || 'thought' in planData);

  const handleStartResearch = () => {
    // Send acceptance message with interrupt feedback
    const greeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
    const acceptanceMessage = `${greeting}! Let's get started.`;
    
    onSendMessage?.(acceptanceMessage, { interruptFeedback: "accepted" });
    
    // Start research session
    onStartResearch?.(message.id);
  };

  // Show loading state if plan is not yet complete or invalid
  if (!isCompleted || !isValidPlan) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-blue-700 dark:text-blue-300">Research Plan</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Generating...
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Card className={cn(
        "w-full transition-all duration-300 hover:shadow-lg",
        "border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800/50",
        "backdrop-blur-sm"
      )}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg transition-colors duration-200",
                "bg-blue-100 dark:bg-blue-900/30"
              )}>
                <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  Research Plan
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {isExecuting ? (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-1" />
                      Executing
                    </Badge>
                  ) : isCompleted ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-300">
                      Ready
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-300">
                      Pending
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Metadata */}
          {(planData.locale || planData.has_enough_context !== undefined) && (
            <div className="flex flex-wrap gap-2 text-xs">
              {planData.locale && (
                <Badge variant="outline" className="border-blue-200 text-blue-700 dark:border-blue-700 dark:text-blue-300">
                  {planData.locale}
                </Badge>
              )}
              <Badge 
                variant="outline" 
                className={`${planData.has_enough_context 
                  ? 'border-green-200 text-green-700 dark:border-green-700 dark:text-green-300' 
                  : 'border-orange-200 text-orange-700 dark:border-orange-700 dark:text-orange-300'
                }`}
              >
                {planData.has_enough_context ? 'Sufficient Context' : 'Additional Context Needed'}
              </Badge>
            </div>
          )}

          {/* Reasoning Section */}
          {planData.thought && (
            <div className="rounded-lg bg-blue-100/50 p-3 border border-blue-200/50 dark:bg-blue-950/30 dark:border-blue-800/50">
              <p className="text-xs font-semibold text-blue-800 dark:text-blue-200 mb-2">Reasoning:</p>
              <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                {planData.thought}
              </p>
            </div>
          )}
          
          {/* Show steps with proper object structure */}
          {planData.steps && planData.steps.length > 0 && (
            <div>
              <h5 className="font-medium text-sm text-muted-foreground mb-2">
                Research Steps:
              </h5>
              <div className="space-y-3">
                {planData.steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-md bg-background/50 border border-border/50"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                     <div className="flex-1 space-y-2">
                       {/* Step title */}
                       <h6 className="font-medium text-sm text-blue-900 dark:text-blue-100 leading-tight">
                         {step.title}
                       </h6>
                       
                       {/* Step description */}
                       <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                         {step.description}
                       </p>
                       
                       {/* Step metadata badges */}
                       <div className="flex flex-wrap gap-1.5">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              step.step_type === 'research' 
                                ? 'border-purple-200 text-purple-700 bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:bg-purple-950/30'
                                : 'border-gray-200 text-gray-700 bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:bg-gray-950/30'
                            }`}
                          >
                            <Settings className="w-3 h-3 mr-1" />
                            {step.step_type}
                          </Badge>
                         
                         {step.need_web_search && (
                           <Badge 
                             variant="outline" 
                             className="text-xs border-green-200 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-300 dark:bg-green-950/30"
                           >
                             <Search className="w-3 h-3 mr-1" />
                             Web Search
                           </Badge>
                         )}
                       </div>
                     </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          
          {/* Start Research Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Button 
              onClick={handleStartResearch}
              disabled={isExecuting}
              className="w-full"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Research In Progress...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Research
                </>
              )}
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};