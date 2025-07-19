
import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Brain, 
  Sparkles,
  Globe,
  Loader2,
  FastForward
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import type { AlegeonStreamingState } from '@/hooks/useAlegeonStreaming';

interface OptimizedStreamingOverlayProps {
  streamingState: AlegeonStreamingState;
  onFastForward?: () => void;
  className?: string;
}

const OptimizedStreamingOverlay: React.FC<OptimizedStreamingOverlayProps> = memo(({
  streamingState,
  onFastForward,
  className
}) => {
  const { 
    isStreaming, 
    displayedText, 
    bufferedText,
    citations, 
    error, 
    isComplete, 
    progress, 
    currentPhaseMessage,
    isTyping,
    typewriterProgress
  } = streamingState;

  // Show overlay during streaming, when there's content, or when there's an error
  const shouldShow = isStreaming || displayedText || error || isComplete;

  if (!shouldShow) {
    return null;
  }

  const getIcon = () => {
    if (error) return Brain;
    if (isComplete && !isTyping) return Sparkles;
    if (isStreaming || isTyping) return Search;
    return Brain;
  };

  const getIconColor = () => {
    if (error) return 'text-red-500';
    if (isComplete && !isTyping) return 'text-emerald-500';
    if (isStreaming || isTyping) return 'text-blue-500';
    return 'text-gray-500';
  };

  const getPhase = () => {
    if (error) return 'Error occurred';
    if (isComplete && !isTyping) return 'Research complete';
    if (isTyping) return 'Displaying results...';
    if (isStreaming && currentPhaseMessage) return currentPhaseMessage;
    return 'Processing...';
  };

  // Combine streaming progress with typewriter progress
  const getTotalProgress = () => {
    if (error) return 0;
    if (isComplete && !isTyping) return 100;
    
    const streamingProgress = progress; // 0-85% for streaming
    const displayProgress = typewriterProgress * 0.15; // 0-15% for typewriter
    
    return Math.min(100, streamingProgress + displayProgress);
  };

  const IconComponent = getIcon();
  const iconColor = getIconColor();
  const currentPhase = getPhase();
  const totalProgress = getTotalProgress();

  // Show fast-forward button if there's buffered content not yet displayed
  const canFastForward = isTyping && bufferedText.length > displayedText.length;

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
              (isStreaming || isTyping) && "animate-pulse"
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
              {(isStreaming || isTyping) && (
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
                  {Math.round(totalProgress)}%
                </span>
              </div>
              <Progress value={totalProgress} className="h-1" />
              {isStreaming && (
                <div className="text-xs text-muted-foreground/75 mt-1">
                  Session timeout: 12 minutes
                </div>
              )}
            </div>
          </div>

          {/* Research Badge & Fast Forward */}
          <div className="flex-shrink-0 flex items-center gap-2">
            {canFastForward && onFastForward && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onFastForward}
                className="h-6 px-2 text-xs hover:bg-background/80"
              >
                <FastForward className="w-3 h-3 mr-1" />
                Skip
              </Button>
            )}
            <div className={cn(
              "text-xs px-2 py-1 rounded-full font-medium",
              (isComplete && !isTyping)
                ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                : "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
            )}>
              Algeon
            </div>
          </div>
        </div>

        {/* Current Text Preview with Typewriter Effect */}
        {displayedText && displayedText.length > 0 && (
          <div className="bg-background/40 backdrop-blur-sm border border-border/30 rounded-lg p-3">
            <div className="text-sm text-foreground/90 leading-relaxed relative">
              {/* Show preview with typewriter effect */}
              <span className="whitespace-pre-wrap">
                {displayedText.length > 300 
                  ? displayedText.substring(0, 300) + '...' 
                  : displayedText
                }
              </span>
              
              {/* Enhanced blinking cursor during typewriter */}
              {isTyping && (
                <span 
                  className="inline-block w-[2px] h-[1.2em] align-text-bottom ml-[1px] animate-pulse bg-blue-500"
                />
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
}, (prevProps, nextProps) => {
  // Custom comparison to avoid unnecessary re-renders
  const prev = prevProps.streamingState;
  const next = nextProps.streamingState;
  
  return (
    prev.isStreaming === next.isStreaming &&
    prev.displayedText === next.displayedText &&
    prev.isComplete === next.isComplete &&
    prev.error === next.error &&
    prev.progress === next.progress &&
    prev.citations.length === next.citations.length &&
    prev.currentPhaseMessage === next.currentPhaseMessage &&
    prev.isTyping === next.isTyping &&
    prev.typewriterProgress === next.typewriterProgress
  );
});

OptimizedStreamingOverlay.displayName = 'OptimizedStreamingOverlay';

export default OptimizedStreamingOverlay;
