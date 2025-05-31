
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import HoverInfoCard from '@/components/ui/hover-info-card';

export interface KeyMetricProps {
  value: string;
  label?: string;
  subValue?: string;
}

interface KeyMetricDisplayProps extends KeyMetricProps {
  title: string;
  hoverContent?: {
    description?: string;
    benchmark?: string;
    methodology?: string;
    insights?: string[];
  };
}

const KeyMetricDisplay: React.FC<KeyMetricDisplayProps> = ({ 
  title, 
  value, 
  label, 
  subValue,
  hoverContent 
}) => {
  const cardContent = (
    <Card className="bg-muted/30 transition-all duration-200 hover:bg-muted/50 hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <span className="text-2xl font-bold text-primary">{value}</span>
        {label && <span className="ml-1 text-sm text-muted-foreground">{label}</span>}
        {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
      </CardContent>
    </Card>
  );

  if (!hoverContent) {
    return cardContent;
  }

  const hoverDetails = (
    <div className="space-y-3">
      {hoverContent.description && (
        <div>
          <h4 className="font-medium text-foreground mb-1">Description</h4>
          <p className="text-muted-foreground">{hoverContent.description}</p>
        </div>
      )}
      {hoverContent.benchmark && (
        <div>
          <h4 className="font-medium text-foreground mb-1">Benchmark</h4>
          <p className="text-muted-foreground">{hoverContent.benchmark}</p>
        </div>
      )}
      {hoverContent.methodology && (
        <div>
          <h4 className="font-medium text-foreground mb-1">Calculation</h4>
          <p className="text-muted-foreground">{hoverContent.methodology}</p>
        </div>
      )}
      {hoverContent.insights && hoverContent.insights.length > 0 && (
        <div>
          <h4 className="font-medium text-foreground mb-1">Key Insights</h4>
          <ul className="text-muted-foreground space-y-1">
            {hoverContent.insights.map((insight, index) => (
              <li key={index} className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <HoverInfoCard
      trigger={cardContent}
      title={`${title} Details`}
      content={hoverDetails}
      side="top"
    />
  );
};

export default KeyMetricDisplay;
