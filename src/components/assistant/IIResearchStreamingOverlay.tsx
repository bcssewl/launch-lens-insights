import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Brain, 
  Sparkles,
  Globe,
  Loader2,
  FileText,
  Link,
  Clock
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { IIResearchStreamingState, ThoughtStep } from '@/hooks/useIIResearchStreaming';

interface IIResearchStreamingOverlayProps {
  streamingState: IIResearchStreamingState;
  className?: string;
}

const IIResearchStreamingOverlay: React.FC<IIResearchStreamingOverlayProps> = ({
  streamingState,
  className
}) => {
  const { 
    isStreaming, 
    thoughtSteps, 
    currentReasoning, 
    finalAnswer, 
    sources, 
    error, 
    currentPhase 
  } = streamingState;

  // Show overlay during streaming, when there's content, or when there's an error
  const shouldShow = isStreaming || thoughtSteps.length > 0 || finalAnswer || error;

  if (!shouldShow) {
    return null;
  }

  const getIcon = () => {
    if (error) return Brain;
    if (finalAnswer) return Sparkles;
    if (isStreaming) return Search;
    return Brain;
  };

  const getIconColor = () => {
    if (error) return 'text-red-500';
    if (finalAnswer) return 'text-emerald-500';
    if (isStreaming) return 'text-blue-500';
    return 'text-gray-500';
  };

  const getPhase = () => {
    if (error) return 'Error occurred';
    if (finalAnswer) return 'Research complete';
    if (currentPhase) return currentPhase;
    if (isStreaming) return 'Researching with II-Agent...';
    return 'Processing...';
  };

  const getProgress = () => {
    if (error) return 0;
    if (finalAnswer) return 100;
    
    // Calculate progress based on thought steps and content
    let progress = 15; // Base progress
    
    if (thoughtSteps.length > 0) {
      progress += Math.min(40, thoughtSteps.length * 8); // Up to 40% for steps
    }
    
    if (sources.length > 0) {
      progress += Math.min(25, sources.length * 5); // Up to 25% for sources
    }
    
    if (currentReasoning) {
      progress += 20; // 20% for active reasoning
    }
    
    return Math.min(95, progress); // Cap at 95% during streaming
  };

  const getLatestActivity = () => {
    if (currentReasoning) {
      return currentReasoning.length > 100 
        ? currentReasoning.substring(0, 100) + '...' 
        : currentReasoning;
    }
    
    if (thoughtSteps.length > 0) {
      const latest = thoughtSteps[thoughtSteps.length - 1];
      switch (latest.type) {
        case 'tool':
          return `Using tool: ${latest.content}`;
        case 'reasoning':
          return latest.content.length > 100 
            ? latest.content.substring(0, 100) + '...' 
            : latest.content;
        case 'visit':
          return `Visiting: ${latest.content}`;
        case 'writing_report':
          return 'Writing final report...';
        default:
          return latest.content;
      }
    }
    
    return 'Starting research...';
  };

  const IconComponent = getIcon();
  const iconColor = getIconColor();
  const currentPhaseText = getPhase();
  const progress = getProgress();
  const latestActivity = getLatestActivity();

  console.log('🔬 IIResearchStreamingOverlay: Rendering with state:', {
    isStreaming,
    thoughtStepsCount: thoughtSteps.length,
    sourcesCount: sources.length,
    currentPhase,
    hasCurrentReasoning: !!currentReasoning,
    hasFinalAnswer: !!finalAnswer,
    error,
    progress
  });

  return (
    <div className={cn(
      "bg-gradient-to-r from-purple-50/95 to-indigo-50/95 dark:from-purple-950/40 dark:to-indigo-950/40",
      "backdrop-blur-sm border border-border/50 rounded-2xl",
      "p-4 transition-all duration-300 shadow-sm",
      className
    )}>
      <div className="space-y-3">
        {/* Main Status */}
        <div className="flex items-center gap-3">
          {/* Animated Icon */}
          <div className={cn(
            "flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full",
            "bg-background/60 backdrop-blur-sm border border-border/30 shadow-sm"
          )}>
            <IconComponent className={cn(
              "w-3 h-3",
              iconColor,
              isStreaming && "animate-pulse"
            )} />
          </div>

          {/* Progress Message */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className={cn(
                "text-sm font-medium text-foreground/90 truncate"
              )}>
                {currentPhaseText}
              </p>
              {isStreaming && (
                <Loader2 className="w-3 h-3 animate-spin text-purple-500" />
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  II-Research Agent
                </span>
                <span className="text-xs text-muted-foreground">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-1" />
            </div>
          </div>

          {/* Research Badge */}
          <div className="flex-shrink-0">
            <div className={cn(
              "text-xs px-2 py-1 rounded-full font-medium",
              finalAnswer 
                ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                : "bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
            )}>
              II-Research
            </div>
          </div>
        </div>

        {/* Current Activity Preview */}
        {latestActivity && (
          <div className="bg-background/40 backdrop-blur-sm border border-border/30 rounded-lg p-3">
            <div className="text-sm text-foreground/90 leading-relaxed">
              {latestActivity}
              {isStreaming && (
                <span className="animate-pulse ml-1 text-purple-500">▍</span>
              )}
            </div>
          </div>
        )}

        {/* Research Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {thoughtSteps.length > 0 && (
            <div className="flex items-center gap-1">
              <Brain className="w-3 h-3" />
              <span>{thoughtSteps.length} step{thoughtSteps.length !== 1 ? 's' : ''}</span>
            </div>
          )}
          
          {sources.length > 0 && (
            <div className="flex items-center gap-1">
              <Globe className="w-3 h-3" />
              <span>{sources.length} source{sources.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50/80 dark:bg-red-950/30 backdrop-blur-sm border border-red-200/50 dark:border-red-800/50 rounded-lg p-3">
            <p className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IIResearchStreamingOverlay;