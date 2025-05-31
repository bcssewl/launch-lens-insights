
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import KeyMetricDisplay from '@/components/results/KeyMetricDisplay';

interface OverviewTabContentProps {
  summary: string;
  metrics: {
    marketSize: { value: string; label?: string; subValue?: string };
    competitionLevel: { value: string; label?: string; subValue?: string };
    problemClarity: { value: string; label?: string; subValue?: string };
    revenuePotential: { value: string; label?: string; subValue?: string };
  };
}

const OverviewTabContent: React.FC<OverviewTabContentProps> = ({ summary, metrics }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">{summary}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KeyMetricDisplay
          title="Market Size"
          value={metrics.marketSize.value}
          label={metrics.marketSize.label}
          subValue={metrics.marketSize.subValue}
          hoverContent={{
            description: "The total addressable market size for your business idea, indicating the revenue opportunity available.",
            benchmark: "Markets >$1B are considered large opportunities, $100M-$1B are substantial, <$100M are niche markets.",
            methodology: "Calculated using industry reports, market research data, and competitive analysis.",
            insights: [
              "Larger markets provide more room for growth",
              "Market size affects scalability potential",
              "Consider market growth rate alongside size"
            ]
          }}
        />
        
        <KeyMetricDisplay
          title="Competition Level"
          value={metrics.competitionLevel.value}
          label={metrics.competitionLevel.label}
          subValue={metrics.competitionLevel.subValue}
          hoverContent={{
            description: "Measures the intensity of competition in your target market. Lower scores indicate less competition.",
            benchmark: "Low (1-3): Blue ocean opportunities, Medium (4-6): Moderate competition, High (7-10): Highly saturated markets.",
            methodology: "Analyzed based on number of competitors, market concentration, and competitive intensity.",
            insights: [
              "Lower competition means easier market entry",
              "High competition may indicate proven market demand",
              "Consider competitive differentiation strategies"
            ]
          }}
        />
        
        <KeyMetricDisplay
          title="Problem Clarity"
          value={metrics.problemClarity.value}
          label={metrics.problemClarity.label}
          subValue={metrics.problemClarity.subValue}
          hoverContent={{
            description: "How well-defined and urgent the problem your solution addresses is for your target customers.",
            benchmark: "High (8-10): Clear pain points, Medium (5-7): Moderate need, Low (1-4): Unclear or minor problems.",
            methodology: "Evaluated through customer research, market validation, and problem-solution fit analysis.",
            insights: [
              "Clear problems lead to stronger product-market fit",
              "Urgent problems drive faster adoption",
              "Validate problem clarity with customer interviews"
            ]
          }}
        />
        
        <KeyMetricDisplay
          title="Revenue Potential"
          value={metrics.revenuePotential.value}
          label={metrics.revenuePotential.label}
          subValue={metrics.revenuePotential.subValue}
          hoverContent={{
            description: "The potential for generating sustainable revenue based on your business model and market conditions.",
            benchmark: "High (8-10): Strong monetization potential, Medium (5-7): Moderate revenue streams, Low (1-4): Uncertain profitability.",
            methodology: "Based on pricing strategy, customer willingness to pay, market size, and business model viability.",
            insights: [
              "Multiple revenue streams increase potential",
              "Recurring revenue models score higher",
              "Consider customer lifetime value and acquisition costs"
            ]
          }}
        />
      </div>
    </div>
  );
};

export default OverviewTabContent;
