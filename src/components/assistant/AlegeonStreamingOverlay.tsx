
import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Brain, 
  FileText, 
  Globe,
  Sparkles,
  ExternalLink,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { AlegeonStreamingState } from '@/hooks/useAlegeonStreaming';

interface AlegeonStreamingOverlayProps {
  streamingState: AlegeonStreamingState;
  className?: string;
}

const AlegeonStreamingOverlay: React.FC<AlegeonStreamingOverlayProps> = ({
  streamingState,
  className
}) => {
  const { isStreaming, currentText, citations, error } = streamingState;

  // Don't show overlay if not streaming and no content
  if (!isStreaming && !currentText && !error) {
    return null;
  }

  // Show different states based on streaming status
  const getIcon = () => {
    if (error) return Brain;
    if (isStreaming) return Search;
    return CheckCircle; // Changed to show completion
  };

  const getIconColor = () => {
    if (error) return 'text-red-500';
    if (isStreaming) return 'text-blue-500';
    return 'text-green-500'; // Changed to green for completion
  };

  const getPhase = () => {
    if (error) return 'Error occurred';
    if (isStreaming) return 'Researching with Algeon...';
    return 'Research Complete'; // Clear completion message
  };

  const getProgress = () => {
    if (error) return 0;
    if (!isStreaming && currentText) return 100;
    if (isStreaming && currentText) {
      // Estimate progress based on content length
      const estimatedProgress = Math.min(90, (currentText.length / 2000) * 70 + 10);
      return estimatedProgress;
    }
    return 10;
  };

  const IconComponent = getIcon();
  const iconColor = getIconColor();
  const currentPhase = getPhase();
  const progress = getProgress();
  const isComplete = !isStreaming && currentText && currentText.length > 0;

  console.log('🎨 AlegeonStreamingOverlay: Rendering with state:', {
    isStreaming,
    currentTextLength: currentText.length,
    citationsCount: citations.length,
    error,
    progress,
    isComplete
  });

  return (
    <div className={cn(
      "absolute top-0 left-0 right-0 transition-all duration-500",
      isComplete 
        ? "bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-950/30 dark:to-emerald-950/30"
        : "bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-950/30 dark:to-purple-950/30",
      "backdrop-blur-sm border border-border/50 rounded-t-2xl",
      "px-4 py-3 shadow-sm",
      className
    )}>
      <div className="space-y-3">
        {/* Main Status */}
        <div className="flex items-center gap-3">
          {/* Animated Icon */}
          <div className={cn(
            "flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full transition-all duration-300",
            "bg-background/60 backdrop-blur-sm border border-border/30 shadow-sm"
          )}>
            <IconComponent className={cn(
              "w-3 h-3 transition-all duration-300",
              iconColor,
              isStreaming && "animate-pulse"
            )} />
          </div>

          {/* Progress Message */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className={cn(
                "text-sm font-medium text-foreground/90 truncate transition-all duration-300"
              )}>
                {currentPhase}
              </p>
              {isStreaming && (
                <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
              )}
              {isComplete && (
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  ✓ Done
                </span>
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
              <Progress 
                value={progress} 
                className={cn(
                  "h-1 transition-all duration-300",
                  isComplete && "bg-green-100 dark:bg-green-900"
                )} 
              />
            </div>
          </div>

          {/* Research Badge */}
          <div className="flex-shrink-0">
            <div className={cn(
              "text-white text-xs px-2 py-1 rounded-full font-medium transition-all duration-300",
              isComplete 
                ? "bg-gradient-to-r from-green-500 to-emerald-500"
                : "bg-gradient-to-r from-blue-500 to-purple-500"
            )}>
              Algeon
            </div>
          </div>
        </div>

        {/* Current Text Preview - Only show during streaming */}
        {isStreaming && currentText && currentText.length > 0 && (
          <div className="bg-background/40 backdrop-blur-sm border border-border/30 rounded-lg p-2">
            <p className="text-xs text-muted-foreground line-clamp-3">
              {currentText.length > 200 
                ? currentText.substring(0, 200) + '...' 
                : currentText
              }
            </p>
          </div>
        )}

        {/* Completion Message */}
        {isComplete && (
          <div className="bg-green-50/40 dark:bg-green-950/20 backdrop-blur-sm border border-green-200/50 dark:border-green-800/50 rounded-lg p-2">
            <p className="text-xs text-green-700 dark:text-green-400 font-medium">
              Research completed successfully. Full content available below.
            </p>
          </div>
        )}

        {/* Citations Section */}
        {citations.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Globe className="w-3 h-3" />
              <span>{citations.length} source{citations.length !== 1 ? 's' : ''} found</span>
            </div>
            
            <div className="grid grid-cols-1 gap-1 max-h-24 overflow-y-auto">
              {citations.slice(0, 3).map((citation, index) => (
                <a
                  key={index}
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors bg-background/40 backdrop-blur-sm border border-border/30 rounded px-2 py-1 group"
                >
                  <Globe className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate flex-1">{citation.name}</span>
                  <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
              {citations.length > 3 && (
                <div className="text-xs text-muted-foreground text-center py-1">
                  +{citations.length - 3} more sources
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50/80 dark:bg-red-950/30 backdrop-blur-sm border border-red-200/50 dark:border-red-800/50 rounded-lg p-2">
            <p className="text-xs text-red-600 dark:text-red-400">
              {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlegeonStreamingOverlay;
