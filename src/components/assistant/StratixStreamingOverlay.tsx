import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { 
  TrendingUp, 
  Target, 
  DollarSign, 
  Cpu,
  FileText,
  Newspaper,
  GraduationCap,
  Building2,
  Globe,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Brain,
  Zap
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { 
  StratixStreamingEvent, 
  StratixSource, 
  StratixAgent, 
  StratixStreamingState
} from '@/types/stratixStreaming';

// Agent and source configurations (moved from types to avoid import issues)
const AGENT_CONFIGS = {
  market_research: {
    name: 'Market Research Specialist',
    color: '#10b981', // Green
    icon: 'TrendingUp'
  },
  business_strategy: {
    name: 'Strategic Business Consultant',
    color: '#8b5cf6', // Purple
    icon: 'Target'
  },
  financial_analysis: {
    name: 'Financial Analysis Expert',
    color: '#f59e0b', // Amber
    icon: 'DollarSign'
  },
  technical_analysis: {
    name: 'Technical Analysis Specialist',
    color: '#3b82f6', // Blue
    icon: 'Cpu'
  }
} as const;

const SOURCE_TYPE_CONFIGS = {
  research: { icon: 'FileText', color: '#10b981' },
  news: { icon: 'Newspaper', color: '#f59e0b' },
  academic: { icon: 'GraduationCap', color: '#8b5cf6' },
  industry: { icon: 'Building2', color: '#3b82f6' },
  web: { icon: 'Globe', color: '#6b7280' }
} as const;

interface StratixStreamingOverlayProps {
  isVisible: boolean;
  streamingState: StratixStreamingState;
  className?: string;
}

// Icon mapping for agents and sources
const getAgentIcon = (role: string) => {
  switch (role) {
    case 'market_research': return TrendingUp;
    case 'business_strategy': return Target;
    case 'financial_analysis': return DollarSign;
    case 'technical_analysis': return Cpu;
    default: return Brain;
  }
};

const getSourceIcon = (type: string) => {
  switch (type) {
    case 'research': return FileText;
    case 'news': return Newspaper;
    case 'academic': return GraduationCap;
    case 'industry': return Building2;
    case 'web': return Globe;
    default: return Globe;
  }
};

const StratixStreamingOverlay: React.FC<StratixStreamingOverlayProps> = ({
  isVisible,
  streamingState,
  className
}) => {
  const [isSourcesExpanded, setIsSourcesExpanded] = useState(false);
  const [lastHeartbeat, setLastHeartbeat] = useState(Date.now());

  // Update heartbeat for connection health
  useEffect(() => {
    if (streamingState.lastHeartbeat) {
      setLastHeartbeat(streamingState.lastHeartbeat);
    }
  }, [streamingState.lastHeartbeat]);

  // Calculate current phase based on progress
  const currentPhase = useMemo(() => {
    const progress = streamingState.overallProgress;
    if (progress <= 5) return 'CONNECTION';
    if (progress <= 15) return 'ROUTING';
    if (progress <= 70) return 'RESEARCH';
    if (progress <= 85) return 'ANALYSIS';
    if (progress <= 95) return 'SYNTHESIS';
    return 'COMPLETION';
  }, [streamingState.overallProgress]);

  // Get active agents count
  const activeAgentsCount = streamingState.activeAgents.filter(
    agent => agent.status === 'analyzing' || agent.status === 'searching'
  ).length;

  if (!isVisible) return null;

  return (
    <div className={cn(
      "relative mb-4 p-4 bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-950/30 dark:to-purple-950/30",
      "backdrop-blur-sm border border-blue-200/50 dark:border-blue-800/50 rounded-lg",
      "transition-all duration-300 ease-in-out",
      isVisible ? "opacity-100 transform translate-y-0" : "opacity-0 transform -translate-y-2",
      className
    )}>
      {/* Header with Research Mode Badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/50 rounded-full">
            <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400 animate-pulse" />
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
              Research Mode
            </span>
          </div>
          {streamingState.synthesisModel && (
            <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/50 rounded-full">
              <Zap className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span className="text-xs text-amber-700 dark:text-amber-300">
                {streamingState.synthesisModel}
              </span>
            </div>
          )}
        </div>
        
        {/* Connection Health Indicator */}
        <div className={cn(
          "w-2 h-2 rounded-full",
          Date.now() - lastHeartbeat < 35000 
            ? "bg-green-500 animate-pulse" 
            : "bg-yellow-500"
        )} />
      </div>

      {/* Main Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            {streamingState.currentPhase}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round(streamingState.overallProgress)}%
          </span>
        </div>
        <Progress 
          value={streamingState.overallProgress} 
          className="h-2 bg-gray-200 dark:bg-gray-700"
        />
      </div>

      {/* Agent Activity Panel */}
      {streamingState.activeAgents.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-foreground">
              Active Specialists
              {streamingState.collaborationMode && (
                <span className="ml-2 text-xs text-muted-foreground">
                  ({streamingState.collaborationMode})
                </span>
              )}
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {streamingState.activeAgents.map((agent) => {
              const IconComponent = getAgentIcon(agent.role);
              const config = AGENT_CONFIGS[agent.role as keyof typeof AGENT_CONFIGS];
              
              return (
                <div
                  key={agent.id}
                  className={cn(
                    "flex items-center gap-3 p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg border",
                    agent.status === 'analyzing' || agent.status === 'searching' 
                      ? "border-blue-200 dark:border-blue-700" 
                      : "border-gray-200 dark:border-gray-600"
                  )}
                >
                  <div className="relative">
                    <IconComponent 
                      className={cn(
                        "w-4 h-4",
                        agent.status === 'complete' ? "text-green-600 dark:text-green-400" :
                        agent.status === 'error' ? "text-red-600 dark:text-red-400" :
                        "text-blue-600 dark:text-blue-400"
                      )}
                      style={{ color: config?.color }}
                    />
                    {(agent.status === 'analyzing' || agent.status === 'searching') && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground truncate">
                      {config?.name || agent.name}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {agent.status === 'analyzing' ? 'Analyzing data...' :
                       agent.status === 'searching' ? 'Finding sources...' :
                       agent.status === 'complete' ? 'Analysis complete' :
                       agent.status}
                    </div>
                  </div>
                  
                  {agent.progress !== undefined && (
                    <div className="text-xs text-muted-foreground">
                      {Math.round(agent.progress)}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Source Discovery Panel */}
      {streamingState.discoveredSources.length > 0 && (
        <div className="mb-3">
          <button
            onClick={() => setIsSourcesExpanded(!isSourcesExpanded)}
            className="flex items-center justify-between w-full text-left mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-medium text-foreground">
                Sources Discovered ({streamingState.discoveredSources.length})
              </span>
            </div>
            {isSourcesExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          {isSourcesExpanded && (
            <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
              {streamingState.discoveredSources.map((source, index) => {
                const IconComponent = getSourceIcon(source.type);
                const typeConfig = SOURCE_TYPE_CONFIGS[source.type as keyof typeof SOURCE_TYPE_CONFIGS];
                
                return (
                  <div
                    key={`${source.url}-${index}`}
                    className="flex items-center gap-3 p-2 bg-white/60 dark:bg-gray-800/60 rounded border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 transition-colors animate-in slide-in-from-right duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <IconComponent 
                      className="w-3 h-3 flex-shrink-0 text-muted-foreground"
                      style={{ color: typeConfig?.color }}
                    />
                    
                    {source.clickable && source.url ? (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 min-w-0 group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-800 dark:group-hover:text-blue-300 truncate">
                            {source.name}
                          </span>
                          <ExternalLink className="w-3 h-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </div>
                        {source.discoveredBy && (
                          <div className="text-xs text-muted-foreground">
                            Found by {source.discoveredBy}
                          </div>
                        )}
                      </a>
                    ) : (
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-foreground truncate">
                          {source.name}
                        </div>
                        {source.discoveredBy && (
                          <div className="text-xs text-muted-foreground">
                            Found by {source.discoveredBy}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Confidence indicator */}
                    <div className={cn(
                      "w-2 h-2 rounded-full flex-shrink-0",
                      source.confidence >= 0.8 ? "bg-green-500" :
                      source.confidence >= 0.6 ? "bg-yellow-500" : "bg-red-500"
                    )} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Live Status Message */}
      {streamingState.currentPhase && (
        <div className="text-xs text-muted-foreground text-center py-1 border-t border-gray-200/50 dark:border-gray-700/50">
          {streamingState.currentPhase}
          {activeAgentsCount > 0 && (
            <span className="ml-2">
              • {activeAgentsCount} specialist{activeAgentsCount !== 1 ? 's' : ''} working
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StratixStreamingOverlay;
