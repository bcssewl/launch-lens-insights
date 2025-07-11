
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Brain, 
  FileText, 
  Globe,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface StreamingUpdate {
  type: 'search' | 'source' | 'snippet' | 'thought' | 'complete';
  message: string;
  timestamp: number;
  data?: {
    source_name?: string;
    source_url?: string;
    snippet_text?: string;
    confidence?: number;
    progress_percentage?: number;
    search_queries?: string[];
    source_type?: string;
  };
}

interface StreamingOverlayProps {
  isVisible: boolean;
  updates: StreamingUpdate[];
  sources?: Array<{
    name: string;
    url: string;
    type?: string;
    confidence?: number;
  }>;
  progress?: {
    phase: string;
    progress: number;
  };
  className?: string;
}

const getIconForUpdateType = (type: string) => {
  switch (type) {
    case 'search':
      return Search;
    case 'source':
      return Globe;
    case 'snippet':
      return FileText;
    case 'thought':
      return Brain;
    case 'complete':
      return Sparkles;
    default:
      return Search;
  }
};

const getPhaseColor = (type: string) => {
  switch (type) {
    case 'search':
      return 'text-blue-500';
    case 'source':
      return 'text-green-500';
    case 'snippet':
      return 'text-orange-500';
    case 'thought':
      return 'text-purple-500';
    case 'complete':
      return 'text-emerald-500';
    default:
      return 'text-gray-500';
  }
};

const getPhaseLabel = (phase: string) => {
  switch (phase) {
    case 'searching':
      return 'Searching';
    case 'discovering':
      return 'Finding Sources';
    case 'analyzing':
      return 'Analyzing Content';
    case 'synthesizing':
      return 'Synthesizing';
    case 'complete':
      return 'Complete';
    default:
      return 'Researching';
  }
};

const StreamingOverlay: React.FC<StreamingOverlayProps> = ({
  isVisible,
  updates,
  sources = [],
  progress = { phase: '', progress: 0 },
  className
}) => {
  const [currentUpdateIndex, setCurrentUpdateIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSources, setShowSources] = useState(false);

  // Debug logging
  console.log('🎨 StreamingOverlay: Rendering with props:', {
    isVisible,
    updatesCount: updates.length,
    sourcesCount: sources.length,
    progress,
    currentUpdateIndex
  });

  // Auto-advance through updates
  useEffect(() => {
    if (updates.length > 0 && currentUpdateIndex < updates.length - 1) {
      const timer = setTimeout(() => {
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentUpdateIndex(prev => prev + 1);
          setIsAnimating(false);
        }, 200);
      }, 2500); // Show each update for 2.5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [updates, currentUpdateIndex]);

  // Reset when new updates arrive
  useEffect(() => {
    if (updates.length > 0) {
      console.log('🔄 StreamingOverlay: Resetting update index for new updates');
      setCurrentUpdateIndex(0);
    }
  }, [updates]);

  // Force visibility for debugging - show overlay if we have any updates
  const shouldShow = isVisible || updates.length > 0;

  console.log('👁️ StreamingOverlay: Visibility check:', {
    isVisible,
    updatesLength: updates.length,
    shouldShow,
    finalDecision: shouldShow && updates.length > 0
  });

  if (!shouldShow || updates.length === 0) {
    console.log('🚫 StreamingOverlay: Not rendering - no visibility or no updates');
    return null;
  }

  const currentUpdate = updates[currentUpdateIndex];
  if (!currentUpdate) {
    console.log('⚠️ StreamingOverlay: No current update available');
    return null;
  }

  const IconComponent = getIconForUpdateType(currentUpdate.type);
  const iconColor = getPhaseColor(currentUpdate.type);
  const hasSnippet = currentUpdate.data?.snippet_text;

  console.log('✅ StreamingOverlay: Rendering overlay with current update:', {
    type: currentUpdate.type,
    message: currentUpdate.message,
    hasSnippet,
    progress: progress.progress
  });

  return (
    <div className={cn(
      "absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-950/30 dark:to-purple-950/30",
      "backdrop-blur-sm border border-border/50 rounded-t-2xl",
      "px-4 py-3 transition-all duration-300 shadow-sm",
      isAnimating && "opacity-70 scale-[0.98]",
      className
    )}>
      <div className="space-y-3">
        {/* Debug Info - Remove in production */}
        <div className="text-xs text-muted-foreground/50 font-mono">
          Debug: {updates.length} updates | {currentUpdateIndex + 1}/{updates.length} | {currentUpdate.type}
        </div>

        {/* Main Status */}
        <div className="flex items-center gap-3">
          {/* Animated Icon */}
          <div className={cn(
            "flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full",
            "bg-background/60 backdrop-blur-sm border border-border/30 shadow-sm"
          )}>
            <IconComponent className={cn("w-3 h-3 animate-pulse", iconColor)} />
          </div>

          {/* Progress Message */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className={cn(
                "text-sm font-medium text-foreground/90 truncate",
                isAnimating && "animate-pulse"
              )}>
                {currentUpdate.message}
              </p>
              {currentUpdate.data?.confidence && (
                <span className="text-xs text-muted-foreground bg-background/50 px-1.5 py-0.5 rounded">
                  {Math.round(currentUpdate.data.confidence * 100)}%
                </span>
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {getPhaseLabel(progress.phase)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {progress.progress}%
                </span>
              </div>
              <Progress value={progress.progress} className="h-1" />
            </div>
          </div>

          {/* Research Badge */}
          <div className="flex-shrink-0">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Research
            </div>
          </div>
        </div>

        {/* Snippet Preview */}
        {hasSnippet && (
          <div className="bg-background/40 backdrop-blur-sm border border-border/30 rounded-lg p-2">
            <p className="text-xs text-muted-foreground line-clamp-2">
              {currentUpdate.data.snippet_text}
            </p>
          </div>
        )}

        {/* Sources Section */}
        {sources.length > 0 && (
          <div className="space-y-2">
            <button
              onClick={() => setShowSources(!showSources)}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>{sources.length} source{sources.length !== 1 ? 's' : ''} found</span>
              {showSources ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            
            {showSources && (
              <div className="grid grid-cols-1 gap-1 max-h-24 overflow-y-auto">
                {sources.map((source, index) => (
                  <a
                    key={index}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors bg-background/40 backdrop-blur-sm border border-border/30 rounded px-2 py-1 group"
                  >
                    <Globe className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate flex-1">{source.name}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-1">
          {updates.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-1 h-1 rounded-full transition-all duration-300",
                index <= currentUpdateIndex
                  ? "bg-blue-500 opacity-100"
                  : "bg-muted-foreground/30 opacity-50"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StreamingOverlay;
