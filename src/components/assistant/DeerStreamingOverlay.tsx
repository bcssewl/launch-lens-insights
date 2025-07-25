import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import { 
  Brain, 
  Sparkles,
  Globe,
  Loader2,
  FastForward,
  Clock,
  Zap,
  TreePine
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import type { DeerStreamingState } from '@/hooks/useDeerStreaming';

interface DeerStreamingOverlayProps {
  streamingState: DeerStreamingState;
  onFastForward?: () => void;
  className?: string;
}

const DeerStreamingOverlay: React.FC<DeerStreamingOverlayProps> = memo(({
  streamingState,
  onFastForward,
  className
}) => {
  const { 
    isStreaming, 
    currentPhase,
    currentReasoning,
    finalAnswer,
    sources,
    thoughtSteps,
    error
  } = streamingState;

  const shouldShow = isStreaming || currentReasoning || finalAnswer || error;

  if (!shouldShow) {
    return null;
  }

  const getIcon = () => {
    if (error) return Brain;
    if (currentPhase === 'completed') return Sparkles;
    if (currentPhase === 'reasoning') return Brain;
    if (currentPhase === 'using_tools' || currentPhase === 'gathering_sources') return Globe;
    if (currentPhase === 'writing_report') return Zap;
    return TreePine;
  };

  const getIconColor = () => {
    if (error) return 'text-red-500';
    if (currentPhase === 'completed') return 'text-emerald-500';
    if (currentPhase === 'reasoning') return 'text-purple-500';
    if (currentPhase === 'using_tools' || currentPhase === 'gathering_sources') return 'text-blue-500';
    if (currentPhase === 'writing_report') return 'text-orange-500';
    return 'text-green-600';
  };

  const getPhaseLabel = () => {
    if (error) return 'Error occurred';
    
    switch (currentPhase) {
      case 'connecting': return 'Connecting to Deer...';
      case 'connected': return 'Connected to Deer';
      case 'reasoning': return 'Deer is thinking...';
      case 'using_tools': return 'Using research tools...';
      case 'gathering_sources': return 'Gathering information...';
      case 'writing_report': return 'Composing response...';
      case 'completed': return 'Deer research complete';
      default: return 'Processing...';
    }
  };

  const getProgress = () => {
    switch (currentPhase) {
      case 'connecting': return 10;
      case 'connected': return 20;
      case 'reasoning': return 30;
      case 'using_tools': return 50;
      case 'gathering_sources': return 70;
      case 'writing_report': return 90;
      case 'completed': return 100;
      default: return 0;
    }
  };

  const IconComponent = getIcon();
  const iconColor = getIconColor();
  const phaseLabel = getPhaseLabel();
  const progress = getProgress();

  const displayedText = finalAnswer || currentReasoning;

  return (
    <div className={cn(
      "bg-gradient-to-r from-green-50/95 to-emerald-50/95 dark:from-green-950/40 dark:to-emerald-950/40",
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
              isStreaming && "animate-pulse"
            )} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground/90 truncate">
                {phaseLabel}
              </p>
              {isStreaming && (
                <Loader2 className="w-3 h-3 animate-spin text-green-500" />
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Deer AI Agent
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
            <div className={cn(
              "text-xs px-2 py-1 rounded-full font-medium",
              currentPhase === 'completed'
                ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                : currentPhase === 'reasoning'
                ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                : "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
            )}>
              <TreePine className="w-3 h-3 inline mr-1" />
              Deer
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
              
              {isStreaming && currentPhase === 'reasoning' && (
                <span className="inline-block w-[2px] h-[1.2em] align-text-bottom ml-[1px] animate-pulse bg-green-500" />
              )}
            </div>
          </div>
        )}

        {/* Thought Steps Display */}
        {thoughtSteps.length > 0 && (
          <div className="space-y-1">
            {thoughtSteps.slice(-3).map((step) => (
              <div key={step.id} className="text-xs text-muted-foreground flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-green-400" />
                <span>{step.content}</span>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Info Bar */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {sources.length > 0 && (
              <div className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                <span>{sources.length} source{sources.length !== 1 ? 's' : ''}</span>
              </div>
            )}
            
            {thoughtSteps.length > 0 && (
              <div className="flex items-center gap-1">
                <Brain className="w-3 h-3" />
                <span>{thoughtSteps.length} step{thoughtSteps.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
          
          <span className="text-xs opacity-75">
            Deer Model
          </span>
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
    prev.currentReasoning === next.currentReasoning &&
    prev.finalAnswer === next.finalAnswer &&
    prev.error === next.error &&
    prev.sources.length === next.sources.length &&
    prev.thoughtSteps.length === next.thoughtSteps.length
  );
});

DeerStreamingOverlay.displayName = 'DeerStreamingOverlay';

export default DeerStreamingOverlay;