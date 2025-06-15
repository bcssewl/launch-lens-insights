
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import KeyMetricDisplay, { KeyMetricProps } from './KeyMetricDisplay';

interface OverviewTabContentProps {
  summary: string;
  metrics: {
    marketSize: KeyMetricProps;
    competitionLevel: KeyMetricProps;
    problemClarity: KeyMetricProps;
    revenuePotential: KeyMetricProps;
  };
}

const OverviewTabContent: React.FC<OverviewTabContentProps> = ({ summary, metrics }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-secondary">{summary}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Key Metrics</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <KeyMetricDisplay title="Market Size" value={metrics.marketSize.value} label={metrics.marketSize.label} />
          <KeyMetricDisplay title="Competition Level" value={metrics.competitionLevel.value} subValue={metrics.competitionLevel.subValue} />
          <KeyMetricDisplay title="Problem Clarity" value={metrics.problemClarity.value} />
          <KeyMetricDisplay title="Revenue Potential" value={metrics.revenuePotential.value} />
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTabContent;
