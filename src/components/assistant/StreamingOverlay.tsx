import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Brain, 
  FileText, 
  TrendingUp, 
  Lightbulb, 
  Zap,
  Globe,
  Users,
  BarChart3,
  Sparkles
} from 'lucide-react';

interface StreamingUpdate {
  type: string;
  message: string;
  timestamp: number;
  agentName?: string;
  sourceName?: string;
  progress?: number;
  agentNames?: string[];
  sourceCount?: number;
}

interface StreamingOverlayProps {
  isVisible: boolean;
  updates: StreamingUpdate[];
  className?: string;
}

const getIconForUpdateType = (type: string) => {
  switch (type) {
    case 'started':
      return Search;
    case 'agents_selected':
      return Users;
    case 'source_discovery_started':
      return Globe;
    case 'source_discovered':
      return FileText;
    case 'research_progress':
      return BarChart3;
    case 'expert_analysis_started':
      return Brain;
    case 'synthesis_started':
      return Sparkles;
    default:
      return TrendingUp;
  }
};

const getProgressColor = (type: string) => {
  switch (type) {
    case 'started':
      return 'text-blue-500';
    case 'agents_selected':
      return 'text-purple-500';
    case 'source_discovery_started':
      return 'text-green-500';
    case 'source_discovered':
      return 'text-emerald-500';
    case 'research_progress':
      return 'text-orange-500';
    case 'expert_analysis_started':
      return 'text-indigo-500';
    case 'synthesis_started':
      return 'text-pink-500';
    default:
      return 'text-gray-500';
  }
};

const StreamingOverlay: React.FC<StreamingOverlayProps> = ({
  isVisible,
  updates,
  className
}) => {
  const [currentUpdateIndex, setCurrentUpdateIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Auto-advance through updates
  useEffect(() => {
    if (updates.length > 0 && currentUpdateIndex < updates.length - 1) {
      const timer = setTimeout(() => {
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentUpdateIndex(prev => prev + 1);
          setIsAnimating(false);
        }, 150);
      }, 2000); // Show each update for 2 seconds
      
      return () => clearTimeout(timer);
    }
  }, [updates, currentUpdateIndex]);

  // Reset when new updates arrive
  useEffect(() => {
    if (updates.length > 0) {
      setCurrentUpdateIndex(0);
    }
  }, [updates]);

  if (!isVisible || updates.length === 0) {
    return null;
  }

  const currentUpdate = updates[currentUpdateIndex];
  const IconComponent = getIconForUpdateType(currentUpdate.type);
  const iconColor = getProgressColor(currentUpdate.type);

  return (
    <div className={cn(
      "absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10",
      "backdrop-blur-sm border-t border-blue-200/20 rounded-t-2xl",
      "px-4 py-3 transition-all duration-300",
      isAnimating && "opacity-50 scale-95",
      className
    )}>
      <div className="flex items-center gap-3">
        {/* Animated Icon */}
        <div className={cn(
          "flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full",
          "bg-white/20 backdrop-blur-sm border border-white/30"
        )}>
          <IconComponent className={cn("w-3 h-3 animate-pulse", iconColor)} />
        </div>

        {/* Progress Message */}
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-xs font-medium text-foreground/90 truncate",
            isAnimating && "animate-pulse"
          )}>
            {currentUpdate.message}
          </p>
          
          {/* Progress indicator dots */}
          <div className="flex items-center gap-1 mt-1">
            {updates.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-1 h-1 rounded-full transition-all duration-300",
                  index <= currentUpdateIndex
                    ? "bg-blue-400 opacity-100"
                    : "bg-gray-400 opacity-30"
                )}
              />
            ))}
          </div>
        </div>

        {/* Research Badge */}
        <div className="flex-shrink-0">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            Research Mode
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamingOverlay;
