
import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Brain, 
  Sparkles,
  Globe,
  Loader2
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { AlegeonStreamingState } from '@/hooks/useAlegeonStreaming';

interface OptimizedStreamingOverlayProps {
  streamingState: AlegeonStreamingState;
  className?: string;
}

const OptimizedStreamingOverlay: React.FC<OptimizedStreamingOverlayProps> = memo(({
  streamingState,
  className
}) => {
  const { isStreaming, displayedText, citations, error, isComplete, progress } = streamingState;

  // Show overlay during streaming, when there's content, or when there's an error
  const shouldShow = isStreaming || displayedText || error || isComplete;

  if (!shouldShow) {
    return null;
  }

  const getIcon = () => {
    if (error) return Brain;
    if (isComplete) return Sparkles;
    if (isStreaming) return Search;
    return Brain;
  };

  const getIconColor = () => {
    if (error) return 'text-red-500';
    if (isComplete) return 'text-emerald-500';
    if (isStreaming) return 'text-blue-500';
    return 'text-gray-500';
  };

  const getPhase = () => {
    if (error) return 'Error occurred';
    if (isComplete) return 'Research complete';
    if (isStreaming) return 'Researching with Algeon...';
    return 'Processing...';
  };

  const IconComponent = getIcon();
  const iconColor = getIconColor();
  const currentPhase = getPhase();

  return (
    <div className={cn(
      "bg-gradient-to-r from-blue-50/95 to-purple-50/95 dark:from-blue-950/40 dark:to-purple-950/40",
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
                {currentPhase}
              </p>
              {isStreaming && (
                <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Algeon Research Agent
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
              isComplete 
                ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                : "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
            )}>
              Algeon
            </div>
          </div>
        </div>

        {/* Current Text Preview - Optimized Display */}
        {displayedText && displayedText.length > 0 && (
          <div className="bg-background/40 backdrop-blur-sm border border-border/30 rounded-lg p-3">
            <div className="text-sm text-foreground/90 leading-relaxed">
              {/* Show preview with smooth reveal */}
              {displayedText.length > 300 
                ? displayedText.substring(0, 300) + '...' 
                : displayedText
              }
              
              {/* Blinking cursor during streaming */}
              {isStreaming && !isComplete && (
                <span className="animate-pulse ml-1 text-blue-500">▍</span>
              )}
            </div>
          </div>
        )}

        {/* Citations Count */}
        {citations.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Globe className="w-3 h-3" />
            <span>{citations.length} source{citations.length !== 1 ? 's' : ''} found</span>
          </div>
        )}

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
});

OptimizedStreamingOverlay.displayName = 'OptimizedStreamingOverlay';

export default OptimizedStreamingOverlay;
