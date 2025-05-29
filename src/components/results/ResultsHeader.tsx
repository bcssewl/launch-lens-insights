
import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import ScoreDisplay from './ScoreDisplay';
import RecommendationBadge from './RecommendationBadge';

interface ResultsHeaderProps {
  ideaName: string;
  score: number;
  recommendationText: string;
  analysisDate: string;
}

const ResultsHeader: React.FC<ResultsHeaderProps> = ({
  ideaName,
  score,
  recommendationText,
  analysisDate,
}) => {
  return (
    <div className="w-full p-4 bg-card rounded-lg shadow space-y-4">
      <div className="w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-primary break-words">{ideaName}</h1>
        <p className="text-sm text-muted-foreground mt-1">Analysis Date: {analysisDate}</p>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
          <ScoreDisplay score={score} maxScore={10} />
          <RecommendationBadge recommendation={recommendationText} />
        </div>
        <div className="flex justify-start">
          <Button variant="outline" size="sm" className="w-fit">
            <Share2 className="mr-2 h-4 w-4" />
            Share Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResultsHeader;
