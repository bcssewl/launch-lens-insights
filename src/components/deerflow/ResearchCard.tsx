import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, FileText, Search, PenTool } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDeerFlowMessageStore } from '@/stores/deerFlowMessageStore';

interface ResearchCardProps {
  researchId: string;
  title?: string;
  onToggleResearch?: () => void;
}

export const ResearchCard = ({ researchId, title, onToggleResearch }: ResearchCardProps) => {
  const { 
    researchPanelState, 
    openResearchPanel,
    closeResearchPanel,
    getResearchStatus,
    getResearchTitle,
    getMessage,
    researchActivityIds,
    researchPlanIds
  } = useDeerFlowMessageStore();
  
  // Get the actual research message (first researcher message)
  const researchMessage = getMessage(researchId);
  
  // Debug logging for research card
  console.log('🔬 DEBUG ResearchCard:', {
    researchId,
    title,
    researchMessage: researchMessage ? {
      id: researchMessage.id,
      role: researchMessage.role,
      agent: researchMessage.agent,
      content: researchMessage.content?.slice(0, 100)
    } : null,
    researchActivities: researchActivityIds.get(researchId),
    planId: researchPlanIds.get(researchId)
  });
  
  const [isAnimating, setIsAnimating] = useState(true);

  // Get research status and title from the store
  const researchStatus = getResearchStatus(researchId);
  const researchTitle = title || getResearchTitle(researchId);

  // Update animation based on research status
  useEffect(() => {
    const shouldAnimate = researchStatus === 'researching' || researchStatus === 'generating-report';
    setIsAnimating(shouldAnimate);
  }, [researchStatus]);

  const handleToggle = () => {
    if (researchPanelState.isOpen && researchPanelState.openResearchId === researchId) {
      closeResearchPanel();
    } else {
      openResearchPanel(researchId, 'activities');
    }
    onToggleResearch?.();
  };

  const getStatusText = () => {
    switch (researchStatus) {
      case 'researching':
        return 'Researching...';
      case 'generating-report':
        return 'Generating Report...';
      case 'completed':
        return 'Report Generated';
      default:
        return 'Research Session';
    }
  };

  const getStatusIcon = () => {
    switch (researchStatus) {
      case 'researching':
        return <Search className="h-4 w-4" />;
      case 'generating-report':
        return <PenTool className="h-4 w-4" />;
      case 'completed':
        return <FileText className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const displayTitle = title || researchTitle || researchMessage?.content?.slice(0, 50) || 'Research Session';

  return (
    <Card className={cn(
      "transition-all duration-300 ease-out",
      "border border-border/50 shadow-sm hover:shadow-md",
      "bg-card/80 backdrop-blur-sm",
      isAnimating && "animate-pulse"
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            {/* Research Title */}
            <h3 className={cn(
              "font-medium text-sm mb-1 truncate",
              isAnimating && "bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-[fade-in_2s_ease-in-out_infinite]"
            )}>
              {displayTitle}
            </h3>
            
            {/* Status */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {getStatusIcon()}
              <span className={cn(
                "transition-colors duration-200",
                isAnimating && "text-primary"
              )}>
                {getStatusText()}
              </span>
            </div>
          </div>

          {/* Toggle Button */}
          <Button
            variant={researchPanelState.isOpen && researchPanelState.openResearchId === researchId ? "outline" : "default"}
            size="sm"
            onClick={handleToggle}
            className={cn(
              "ml-3 transition-all duration-200",
              "hover:scale-105 active:scale-95"
            )}
          >
            <span className="text-xs">
              {researchPanelState.isOpen && researchPanelState.openResearchId === researchId ? 'Close' : 'Open'}
            </span>
            <ChevronRight className={cn(
              "h-3 w-3 ml-1 transition-transform duration-200",
              researchPanelState.isOpen && researchPanelState.openResearchId === researchId && "rotate-90"
            )} />
          </Button>
        </div>

        {/* Progress Indicator */}
        {isAnimating && (
          <div className="mt-3">
            <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
              <div className={cn(
                "h-full bg-gradient-to-r from-primary to-accent rounded-full",
                "animate-[slide-in-right_2s_ease-in-out_infinite]"
              )} />
            </div>
          </div>
        )}

        {/* Completion Badge */}
        {researchStatus === 'completed' && (
          <div className="mt-2 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
            <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full animate-pulse" />
            <span>Research complete - Click to view full report</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};