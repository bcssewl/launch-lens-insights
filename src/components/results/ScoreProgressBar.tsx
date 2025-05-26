
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ScoreProgressBarProps {
  label: string;
  score: number;
  maxScore: number;
}

const ScoreProgressBar: React.FC<ScoreProgressBarProps> = ({ label, score, maxScore }) => {
  const percentage = (score / maxScore) * 100;
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm font-semibold text-primary">{score}/{maxScore}</span>
      </div>
      <Progress value={percentage} className="h-3" />
       {/* Display lower is better for specific categories like Competition Level */}
      {label.toLowerCase().includes("competition") && (
        <p className="text-xs text-muted-foreground mt-1">Lower score is better for Competition Level.</p>
      )}
    </div>
  );
};

export default ScoreProgressBar;
