
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  completed: number;
  total: number;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact';
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  completed,
  total,
  showPercentage = true,
  size = 'md',
  variant = 'default'
}) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isComplete = completed === total && total > 0;

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        {isComplete ? (
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        ) : (
          <Circle className="w-4 h-4 text-muted-foreground" />
        )}
        <span className="text-xs text-muted-foreground">
          {completed}/{total} complete
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className={cn(
          "font-medium",
          size === 'sm' && "text-xs",
          size === 'md' && "text-sm",
          size === 'lg' && "text-base"
        )}>
          Progress
        </span>
        <span className={cn(
          "text-muted-foreground",
          size === 'sm' && "text-xs",
          size === 'md' && "text-sm",
          size === 'lg' && "text-base"
        )}>
          {showPercentage ? `${percentage}%` : `${completed}/${total}`}
        </span>
      </div>
      <Progress 
        value={percentage} 
        className={cn(
          size === 'sm' && "h-1.5",
          size === 'md' && "h-2",
          size === 'lg' && "h-3"
        )}
      />
    </div>
  );
};

export default ProgressIndicator;
