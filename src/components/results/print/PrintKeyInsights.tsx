
import React from 'react';

interface PrintKeyInsightsProps {
  metrics: {
    marketSize: { value: string; label?: string };
    competitionLevel: { value: string; subValue?: string };
    problemClarity: { value: string };
    revenuePotential: { value: string };
  };
}

const PrintKeyInsights: React.FC<PrintKeyInsightsProps> = ({ metrics }) => {
  const getMetricColor = (value: string) => {
    const lowerValue = value.toLowerCase();
    if (lowerValue.includes('high') || lowerValue.includes('excellent') || lowerValue.includes('strong')) {
      return '#059669';
    } else if (lowerValue.includes('medium') || lowerValue.includes('moderate') || lowerValue.includes('good')) {
      return '#d97706';
    } else if (lowerValue.includes('low') || lowerValue.includes('weak') || lowerValue.includes('poor')) {
      return '#dc2626';
    }
    return '#6b7280';
  };

  const metricCards = [
    {
      title: 'Market Size',
      value: metrics.marketSize.value,
      subtitle: metrics.marketSize.label,
      icon: '📊'
    },
    {
      title: 'Competition Level',
      value: metrics.competitionLevel.value,
      subtitle: metrics.competitionLevel.subValue,
      icon: '⚔️'
    },
    {
      title: 'Problem Clarity',
      value: metrics.problemClarity.value,
      subtitle: 'Market need validation',
      icon: '🎯'
    },
    {
      title: 'Revenue Potential',
      value: metrics.revenuePotential.value,
      subtitle: 'Monetization opportunity',
      icon: '💰'
    }
  ];

  return (
    <div className="print-section">
      <h2 className="print-title-2">Key Insights & Metrics</h2>
      
      <div className="print-grid-2 mb-8">
        {metricCards.map((metric, index) => (
          <div key={index} className="print-metric-card">
            <div className="text-2xl mb-2">{metric.icon}</div>
            <div className="print-metric-label mb-1">{metric.title}</div>
            <div 
              className="print-metric-value"
              style={{ color: getMetricColor(metric.value) }}
            >
              {metric.value}
            </div>
            {metric.subtitle && (
              <div className="text-xs text-gray-500 mt-1">{metric.subtitle}</div>
            )}
          </div>
        ))}
      </div>

      {/* Market Readiness Assessment */}
      <div className="print-avoid-break">
        <h3 className="print-title-3">Market Readiness Assessment</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">Market Timing</span>
            <span className="print-status-high">Excellent</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Technology Readiness</span>
            <span className="print-status-high">Ready</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Target Audience</span>
            <span className="print-status-medium">Well-Defined</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Business Model</span>
            <span className="print-status-medium">Developing</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintKeyInsights;
