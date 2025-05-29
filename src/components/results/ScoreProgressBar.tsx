
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ScoreProgressBarProps {
  label: string;
  score: number;
  maxScore: number;
}

const ScoreProgressBar: React.FC<ScoreProgressBarProps> = ({ label, score, maxScore }) => {
  const percentage = (score / maxScore) * 100;
  
  // Determine color class based on percentage
  const getColorClass = (percent: number) => {
    if (percent >= 80) return 'bg-green-500'; // Excellent
    if (percent >= 60) return 'bg-blue-500';  // Good
    if (percent >= 40) return 'bg-yellow-500'; // Average
    if (percent >= 20) return 'bg-orange-500'; // Below average
    return 'bg-red-500'; // Poor
  };

  const colorClass = getColorClass(percentage);

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm font-semibold text-primary">{score}/{maxScore}</span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full transition-all duration-300", colorClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {/* Display lower is better for specific categories like Competition Level */}
      {label.toLowerCase().includes("competition") && (
        <p className="text-xs text-muted-foreground mt-1">Lower score is better for Competition Level.</p>
      )}
    </div>
  );
};

export default ScoreProgressBar;
