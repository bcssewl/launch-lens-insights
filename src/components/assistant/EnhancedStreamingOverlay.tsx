
import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import { 
  Brain, 
  Sparkles,
  Globe,
  Loader2,
  FastForward,
  Clock,
  Zap
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import type { AlegeonStreamingStateV2 } from '@/hooks/useAlegeonStreamingV2';

interface EnhancedStreamingOverlayProps {
  streamingState: AlegeonStreamingStateV2;
  onFastForward?: () => void;
  className?: string;
}

const EnhancedStreamingOverlay: React.FC<EnhancedStreamingOverlayProps> = memo(({
  streamingState,
  onFastForward,
  className
}) => {
  const { 
    isStreaming, 
    currentPhase,
    displayedText, 
    bufferedText,
    citations, 
    error, 
    isComplete, 
    progress, 
    progressDetail,
    isTyping,
    metadata
  } = streamingState;

  const shouldShow = isStreaming || displayedText || error || isComplete;

  if (!shouldShow) {
    return null;
  }

  const getIcon = () => {
    if (error) return Brain;
    if (currentPhase === 'complete' && !isTyping) return Sparkles;
    if (currentPhase === 'reasoning') return Brain;
    if (currentPhase === 'generating' || isTyping) return Zap;
    return Brain;
  };

  const getIconColor = () => {
    if (error) return 'text-red-500';
    if (currentPhase === 'complete' && !isTyping) return 'text-emerald-500';
    if (currentPhase === 'reasoning') return 'text-purple-500';
    if (currentPhase === 'generating' || isTyping) return 'text-blue-500';
    return 'text-gray-500';
  };

  const getPhaseLabel = () => {
    if (error) return 'Error occurred';
    if (progressDetail) return progressDetail;
    
    switch (currentPhase) {
      case 'reasoning': return 'Agent is thinking...';
      case 'generating': return 'Generating response...';
      case 'complete': return isTyping ? 'Displaying results...' : 'Research complete';
      default: return 'Processing...';
    }
  };

  const canFastForward = isTyping && bufferedText.length > displayedText.length;
  const IconComponent = getIcon();
  const iconColor = getIconColor();
  const phaseLabel = getPhaseLabel();

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

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground/90 truncate">
                {phaseLabel}
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
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-1" />
            </div>
          </div>

          {/* Controls & Badge */}
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
              currentPhase === 'complete' && !isTyping
                ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                : currentPhase === 'reasoning'
                ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
            )}>
              {currentPhase === 'reasoning' ? 'Thinking' : 'Algeon'}
            </div>
          </div>
        </div>

        {/* Content Preview */}
        {displayedText && displayedText.length > 0 && (
          <div className="bg-background/40 backdrop-blur-sm border border-border/30 rounded-lg p-3">
            <div className="text-sm text-foreground/90 leading-relaxed relative">
              <span className="whitespace-pre-wrap">
                {displayedText.length > 300 
                  ? displayedText.substring(0, 300) + '...' 
                  : displayedText
                }
              </span>
              
              {isTyping && (
                <span className="inline-block w-[2px] h-[1.2em] align-text-bottom ml-[1px] animate-pulse bg-blue-500" />
              )}
            </div>
          </div>
        )}

        {/* Bottom Info Bar */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {citations.length > 0 && (
              <div className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                <span>{citations.length} source{citations.length !== 1 ? 's' : ''}</span>
              </div>
            )}
            
            {metadata?.duration && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{Math.round(metadata.duration)}s total</span>
              </div>
            )}
          </div>
          
          {metadata?.model_name && (
            <span className="text-xs opacity-75">
              {metadata.model_name}
            </span>
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
}, (prevProps, nextProps) => {
  const prev = prevProps.streamingState;
  const next = nextProps.streamingState;
  
  return (
    prev.isStreaming === next.isStreaming &&
    prev.currentPhase === next.currentPhase &&
    prev.displayedText === next.displayedText &&
    prev.isComplete === next.isComplete &&
    prev.error === next.error &&
    prev.progress === next.progress &&
    prev.progressDetail === next.progressDetail &&
    prev.citations.length === next.citations.length &&
    prev.isTyping === next.isTyping
  );
});

EnhancedStreamingOverlay.displayName = 'EnhancedStreamingOverlay';

export default EnhancedStreamingOverlay;
