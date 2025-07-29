import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Play, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DeerMessage } from '@/stores/deerFlowMessageStore';
import { motion } from 'motion/react';

interface PlanData {
  title?: string;
  steps?: string[];
  topics?: string[];
  approach?: string;
  deliverable?: string;
}

interface PlanCardProps {
  message: DeerMessage;
  onStartResearch?: (planId: string) => void;
  isExecuting?: boolean;
}

export const PlanCard = ({ message, onStartResearch, isExecuting = false }: PlanCardProps) => {
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    try {
      const parsed = JSON.parse(message.content || '{}');
      setPlanData(parsed);
    } catch {
      // If parsing fails, extract from markdown-like content
      const content = message.content || '';
      const titleMatch = content.match(/^#\s*(.+)/m);
      const stepsMatch = content.match(/(?:Steps?|Plan):\s*\n((?:\d+\.\s*.+\n?)+)/i);
      
      setPlanData({
        title: titleMatch?.[1] || 'Research Plan',
        steps: stepsMatch?.[1]?.split('\n').filter(step => step.trim()).map(step => step.replace(/^\d+\.\s*/, '')) || [],
      });
    }
  }, [message.content]);

  useEffect(() => {
    // Check if research is completed (can be expanded based on your completion logic)
    setIsCompleted(!message.isStreaming && message.content.length > 0);
  }, [message.isStreaming, message.content]);

  const handleStartResearch = () => {
    if (onStartResearch) {
      onStartResearch(message.id);
    }
  };

  if (!planData) {
    return (
      <Card className="w-full border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 animate-pulse">
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="h-4 bg-blue-200 dark:bg-blue-800 rounded w-3/4"></div>
            <div className="h-3 bg-blue-200 dark:bg-blue-800 rounded w-full"></div>
            <div className="h-3 bg-blue-200 dark:bg-blue-800 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
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
          {planData.title && (
            <div>
              <h4 className="font-semibold text-lg text-foreground mb-2">
                {planData.title}
              </h4>
            </div>
          )}

          {planData.approach && (
            <div className="p-3 bg-blue-100/50 dark:bg-blue-950/30 rounded-lg">
              <h5 className="font-medium text-sm text-blue-900 dark:text-blue-200 mb-1">
                Approach:
              </h5>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                {planData.approach}
              </p>
            </div>
          )}
          
          {planData.steps && planData.steps.length > 0 && (
            <div>
              <h5 className="font-medium text-sm text-muted-foreground mb-2">
                Research Steps:
              </h5>
              <div className="space-y-2">
                {planData.steps.map((step: string, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-start gap-3 p-2 rounded-md bg-background/50"
                  >
                    <div className={cn(
                      "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                      "bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200"
                    )}>
                      {index + 1}
                    </div>
                    <span className="text-sm text-foreground leading-relaxed">
                      {step}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {planData.topics && planData.topics.length > 0 && (
            <div>
              <h5 className="font-medium text-sm text-muted-foreground mb-2">
                Key Topics:
              </h5>
              <div className="flex flex-wrap gap-2">
                {planData.topics.map((topic: string, index: number) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/20 dark:border-blue-800 dark:text-blue-300"
                  >
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {planData.deliverable && (
            <div className="p-3 bg-green-100/50 dark:bg-green-950/30 rounded-lg">
              <h5 className="font-medium text-sm text-green-900 dark:text-green-200 mb-1">
                Expected Deliverable:
              </h5>
              <p className="text-sm text-green-800 dark:text-green-300">
                {planData.deliverable}
              </p>
            </div>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Button 
              onClick={handleStartResearch}
              disabled={isExecuting}
              className={cn(
                "w-full transition-all duration-200",
                "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600",
                "text-white shadow-md hover:shadow-lg",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isExecuting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Executing Research...
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