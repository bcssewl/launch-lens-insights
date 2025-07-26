import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Search, Brain, BookOpen, PenTool, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResearchPhase {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
  progress?: number;
}

interface ResearchProgressProps {
  currentPhase: string;
  phases?: ResearchPhase[];
  overallProgress?: number;
  searchQueries?: string[];
  sourcesFound?: number;
  className?: string;
}

const defaultPhases: ResearchPhase[] = [
  {
    id: 'planning',
    name: 'Planning',
    description: 'Creating research strategy',
    status: 'pending'
  },
  {
    id: 'searching',
    name: 'Searching',
    description: 'Finding relevant sources',
    status: 'pending'
  },
  {
    id: 'analyzing',
    name: 'Analyzing',
    description: 'Processing information',
    status: 'pending'
  },
  {
    id: 'synthesizing',
    name: 'Synthesizing',
    description: 'Creating final report',
    status: 'pending'
  }
];

export const ResearchProgress: React.FC<ResearchProgressProps> = ({
  currentPhase,
  phases = defaultPhases,
  overallProgress = 0,
  searchQueries = [],
  sourcesFound = 0,
  className
}) => {
  const getPhaseIcon = (phaseId: string) => {
    switch (phaseId) {
      case 'planning':
        return Brain;
      case 'searching':
        return Search;
      case 'analyzing':
        return BookOpen;
      case 'synthesizing':
        return PenTool;
      default:
        return CheckCircle;
    }
  };

  const getPhaseStatus = (phaseId: string): ResearchPhase['status'] => {
    const phaseOrder = ['planning', 'searching', 'analyzing', 'synthesizing'];
    const currentIndex = phaseOrder.indexOf(currentPhase);
    const phaseIndex = phaseOrder.indexOf(phaseId);
    
    if (phaseIndex < currentIndex) return 'completed';
    if (phaseIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <Card className={cn("border-primary/20 bg-primary/5", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Search className="w-5 h-5 text-primary" />
          Research Progress
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Overall Progress</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        <div className="space-y-3">
          {phases.map((phase) => {
            const Icon = getPhaseIcon(phase.id);
            const status = getPhaseStatus(phase.id);
            
            return (
              <div
                key={phase.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-all",
                  status === 'active' && "bg-primary/10 border border-primary/20",
                  status === 'completed' && "bg-green-500/10"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5",
                  status === 'active' && "text-primary animate-pulse",
                  status === 'completed' && "text-green-500",
                  status === 'pending' && "text-muted-foreground"
                )} />
                
                <div className="flex-1">
                  <p className={cn(
                    "font-medium text-sm",
                    status === 'pending' && "text-muted-foreground"
                  )}>
                    {phase.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {phase.description}
                  </p>
                </div>

                {status === 'completed' && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </div>
            );
          })}
        </div>

        {(searchQueries.length > 0 || sourcesFound > 0) && (
          <div className="pt-3 border-t border-primary/20 space-y-2">
            {searchQueries.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Active Searches ({searchQueries.length})
                </p>
                <div className="space-y-1">
                  {searchQueries.slice(-3).map((query, index) => (
                    <p key={index} className="text-xs text-foreground/80 truncate">
                      "{query}"
                    </p>
                  ))}
                </div>
              </div>
            )}
            
            {sourcesFound > 0 && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-primary">{sourcesFound}</span> sources discovered
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};