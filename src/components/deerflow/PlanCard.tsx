import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Play, CheckCircle, Clock, Loader2, Search, Cog, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DeerMessage } from '@/stores/deerFlowMessageStore';
import { motion } from 'motion/react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useDeerFlowMessageStore } from '@/stores/deerFlowMessageStore';

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

interface PlanCardProps {
  message: DeerMessage;
  onStartResearch?: (planId: string) => void;
  onSendMessage?: (message: string, options?: { interruptFeedback?: string }) => void; // ADD
  isExecuting?: boolean;
}

export const PlanCard = ({ message, onStartResearch, onSendMessage, isExecuting = false }: PlanCardProps) => {
  const [planData, setPlanData] = useState<Plan | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isErrorExpanded, setIsErrorExpanded] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  
  // Parse plan data from message content
  useEffect(() => {
    if (!message?.content) {
      setPlanData(null);
      setParseError("No content available");
      return;
    }

    try {
      // Handle streamed content - try direct JSON parse first
      let content = message.content.trim();
      
      // If content starts with text before JSON, try to extract JSON block
      if (!content.startsWith('{')) {
        const jsonMatch = content.match(/```json\s*(\{.*?\})\s*```/s) || 
                         content.match(/(\{.*\})/s);
        if (jsonMatch) {
          content = jsonMatch[1];
        }
      }
      
      const parsed = JSON.parse(content) as Plan;
      
      // Validate required fields
      if (!parsed.title || !Array.isArray(parsed.steps)) {
        throw new Error("Invalid plan structure: missing title or steps");
      }
      
      setPlanData(parsed);
      setParseError(null);
      console.log('📋 Parsed plan data:', parsed);
    } catch (error) {
      console.error('❌ Failed to parse planner content:', error);
      setParseError(`JSON parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setPlanData(null);
    }
  }, [message.content]);

  useEffect(() => {
    // Check if research is completed (can be expanded based on your completion logic)
    setIsCompleted(!message.isStreaming && message.content.length > 0);
  }, [message.isStreaming, message.content]);

  const handleStartResearch = () => {
    if (onSendMessage) {
      // Send acceptance message to backend (matching original DeerFlow)
      const greeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
      const acceptanceMessage = `${greeting}! Let's get started.`;
      
      onSendMessage(acceptanceMessage, {
        interruptFeedback: "accepted"
      });
      
      console.log('📤 Sent plan acceptance:', acceptanceMessage);
    }
    
    // Also start local research session
    if (onStartResearch) {
      onStartResearch(message.id);
    }
  };

  // Error state with collapsible raw content
  if (parseError) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="font-semibold text-red-700">Plan Parsing Error</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-red-600">
              Unable to parse research plan. Expected JSON format.
            </p>
            
            <Collapsible open={isErrorExpanded} onOpenChange={setIsErrorExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-between text-red-600">
                  View Raw Content
                  {isErrorExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2">
                <div className="rounded border bg-red-100/50 p-3">
                  <p className="text-xs font-medium text-red-700 mb-1">Error:</p>
                  <p className="text-xs text-red-600 mb-3">{parseError}</p>
                  <p className="text-xs font-medium text-red-700 mb-1">Raw Content:</p>
                  <pre className="text-xs text-red-600 whitespace-pre-wrap break-words">
                    {message.content}
                  </pre>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Loading state while parsing or if no plan data yet
  if (!planData) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-700">Research Plan</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                Generating...
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
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
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Ready
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-300">
                      <Clock className="w-3 h-3 mr-1" />
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
                <Badge variant="outline" className="border-blue-200 text-blue-700">
                  {planData.locale}
                </Badge>
              )}
              <Badge 
                variant="outline" 
                className={`${planData.has_enough_context 
                  ? 'border-green-200 text-green-700' 
                  : 'border-orange-200 text-orange-700'
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
                           <Cog className="w-3 h-3 mr-1" />
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