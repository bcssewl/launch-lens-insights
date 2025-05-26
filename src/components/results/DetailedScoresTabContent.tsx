
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ScoreProgressBar from './ScoreProgressBar';

interface ScoreItem {
  category: string;
  score: number;
}

interface DetailedScoresTabContentProps {
  scores: ScoreItem[];
}

const DetailedScoresTabContent: React.FC<DetailedScoresTabContentProps> = ({ scores }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detailed Score Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {scores.map((item) => (
          <ScoreProgressBar key={item.category} label={item.category} score={item.score} maxScore={10} />
        ))}
      </CardContent>
    </Card>
  );
};

export default DetailedScoresTabContent;
