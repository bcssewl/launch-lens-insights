
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
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-card rounded-lg shadow">
      <div className="flex-1">
        <h1 className="text-3xl font-bold text-primary">{ideaName}</h1>
        <p className="text-sm text-muted-foreground">Analysis Date: {analysisDate}</p>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <ScoreDisplay score={score} maxScore={10} />
        <RecommendationBadge recommendation={recommendationText} />
        <Button variant="outline" size="sm">
          <Share2 className="mr-2 h-4 w-4" />
          Share Report
        </Button>
      </div>
    </div>
  );
};

export default ResultsHeader;
