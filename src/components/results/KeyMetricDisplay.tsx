
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface KeyMetricProps {
  value: string;
  label?: string;
  subValue?: string;
}

interface KeyMetricDisplayProps extends KeyMetricProps {
  title: string;
}

const KeyMetricDisplay: React.FC<KeyMetricDisplayProps> = ({ title, value, label, subValue }) => {
  return (
    <Card className="bg-muted/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <span className="text-2xl font-bold text-primary">{value}</span>
        {label && <span className="ml-1 text-sm text-foreground">{label}</span>}
        {subValue && <p className="text-xs text-tertiary">{subValue}</p>}
      </CardContent>
    </Card>
  );
};

export default KeyMetricDisplay;
