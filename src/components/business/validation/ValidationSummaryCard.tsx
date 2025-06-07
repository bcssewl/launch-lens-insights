
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ValidationSummaryCardProps {
  ideaName: string;
  description: string;
  score: number;
  recommendation: string;
}

const ValidationSummaryCard: React.FC<ValidationSummaryCardProps> = ({
  ideaName,
  description,
  score,
  recommendation
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600';
    if (score >= 5) return 'text-blue-600';
    if (score >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (score: number) => {
    if (score >= 7) return { text: 'Validated', class: 'bg-green-100 text-green-800 border-green-200' };
    if (score >= 5) return { text: 'Promising', class: 'bg-blue-100 text-blue-800 border-blue-200' };
    if (score >= 3) return { text: 'Caution', class: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    return { text: 'High Risk', class: 'bg-red-100 text-red-800 border-red-200' };
  };

  const statusBadge = getStatusBadge(score);

  return (
    <Card className="enhanced-card">
      <CardHeader>
        <CardTitle>Validation Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-foreground mb-2">Business Idea</h4>
            <h3 className="text-xl font-bold text-primary mb-2">{ideaName}</h3>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Validation Score</h4>
            <div className="flex items-center gap-3">
              <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
                {score}/10
              </span>
              <Badge variant="outline" className={statusBadge.class}>
                {statusBadge.text}
              </Badge>
            </div>
          </div>
        </div>
        
        {recommendation && (
          <div className="pt-4 border-t">
            <h4 className="font-semibold text-foreground mb-2">Recommendation</h4>
            <p className="text-muted-foreground leading-relaxed">{recommendation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ValidationSummaryCard;
