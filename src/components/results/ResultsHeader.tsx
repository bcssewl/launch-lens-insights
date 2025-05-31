
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import RecommendationCard from './RecommendationCard';

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
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRecommendationStatus = (score: number) => {
    if (score >= 7) return 'proceed';
    if (score >= 4) return 'caution';
    return 'high-risk';
  };

  return (
    <div className="section-spacing">
      {/* Header Card */}
      <Card className="premium-card">
        <CardHeader className="text-center space-y-4">
          <div className="space-y-2">
            <Badge variant="outline" className="text-xs text-muted-foreground border-muted-foreground/30">
              Analysis completed • {analysisDate}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              {ideaName}
            </h1>
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className={`text-6xl font-bold ${getScoreColor(score)}`}>
                  {score.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Overall Score</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Recommendation Card */}
      <RecommendationCard 
        recommendation={recommendationText}
        score={score}
        status={getRecommendationStatus(score)}
      />
    </div>
  );
};

export default ResultsHeader;
