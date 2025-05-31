
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import HoverInfoCard from '@/components/ui/hover-info-card';

interface ScoreProgressBarProps {
  label: string;
  score: number;
  maxScore: number;
  hoverContent?: {
    description?: string;
    methodology?: string;
    benchmark?: string;
    improvements?: string[];
  };
}

const ScoreProgressBar: React.FC<ScoreProgressBarProps> = ({ 
  label, 
  score, 
  maxScore,
  hoverContent 
}) => {
  // Scale down scores that are between 10 and 100 by dividing by 10
  const scaledScore = score > 10 && score < 100 ? score / 10 : score;
  const percentage = (scaledScore / maxScore) * 100;
  
  // Determine color class based on percentage
  const getColorClass = (percent: number) => {
    if (percent >= 80) return 'bg-green-500'; // Excellent
    if (percent >= 60) return 'bg-blue-500';  // Good
    if (percent >= 40) return 'bg-yellow-500'; // Average
    if (percent >= 20) return 'bg-orange-500'; // Below average
    return 'bg-red-500'; // Poor
  };

  const getScoreInterpretation = (percent: number) => {
    if (percent >= 80) return 'Excellent';
    if (percent >= 60) return 'Good';
    if (percent >= 40) return 'Average';
    if (percent >= 20) return 'Below Average';
    return 'Needs Improvement';
  };

  const colorClass = getColorClass(percentage);
  const interpretation = getScoreInterpretation(percentage);

  const progressBarContent = (
    <div className="transition-all duration-200 hover:scale-[1.02]">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm font-semibold text-primary">{scaledScore.toFixed(1)}/{maxScore}</span>
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

  if (!hoverContent) {
    return progressBarContent;
  }

  const hoverDetails = (
    <div className="space-y-3">
      <div>
        <h4 className="font-medium text-foreground mb-1">Score Interpretation</h4>
        <p className={cn("font-medium", 
          percentage >= 80 ? "text-green-600" :
          percentage >= 60 ? "text-blue-600" :
          percentage >= 40 ? "text-yellow-600" :
          percentage >= 20 ? "text-orange-600" : "text-red-600"
        )}>
          {interpretation} ({percentage.toFixed(1)}%)
        </p>
      </div>
      
      {hoverContent.description && (
        <div>
          <h4 className="font-medium text-foreground mb-1">What This Measures</h4>
          <p className="text-muted-foreground">{hoverContent.description}</p>
        </div>
      )}
      
      {hoverContent.methodology && (
        <div>
          <h4 className="font-medium text-foreground mb-1">How It's Calculated</h4>
          <p className="text-muted-foreground">{hoverContent.methodology}</p>
        </div>
      )}
      
      {hoverContent.benchmark && (
        <div>
          <h4 className="font-medium text-foreground mb-1">Industry Benchmark</h4>
          <p className="text-muted-foreground">{hoverContent.benchmark}</p>
        </div>
      )}
      
      {hoverContent.improvements && hoverContent.improvements.length > 0 && (
        <div>
          <h4 className="font-medium text-foreground mb-1">Improvement Suggestions</h4>
          <ul className="text-muted-foreground space-y-1">
            {hoverContent.improvements.map((improvement, index) => (
              <li key={index} className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>{improvement}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <HoverInfoCard
      trigger={progressBarContent}
      title={`${label} Analysis`}
      content={hoverDetails}
      side="right"
    />
  );
};

export default ScoreProgressBar;
