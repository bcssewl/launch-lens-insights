
import React from 'react';
import PrintIcon from './PrintIcon';

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

  const getMetricScore = (value: string) => {
    const lowerValue = value.toLowerCase();
    if (lowerValue.includes('high') || lowerValue.includes('excellent') || lowerValue.includes('strong')) {
      return 9;
    } else if (lowerValue.includes('medium') || lowerValue.includes('moderate') || lowerValue.includes('good')) {
      return 7;
    } else if (lowerValue.includes('low') || lowerValue.includes('weak') || lowerValue.includes('poor')) {
      return 4;
    }
    return 6;
  };

  const metricCards = [
    {
      title: 'Market Size',
      value: metrics.marketSize.value,
      subtitle: metrics.marketSize.label || 'Total addressable market',
      icon: 'market-analysis' as const,
      category: 'Market Opportunity'
    },
    {
      title: 'Competition Level',
      value: metrics.competitionLevel.value,
      subtitle: metrics.competitionLevel.subValue || 'Competitive intensity',
      icon: 'competition' as const,
      category: 'Competitive Landscape'
    },
    {
      title: 'Problem Clarity',
      value: metrics.problemClarity.value,
      subtitle: 'Market need validation',
      icon: 'swot' as const,
      category: 'Problem-Solution Fit'
    },
    {
      title: 'Revenue Potential',
      value: metrics.revenuePotential.value,
      subtitle: 'Monetization opportunity',
      icon: 'financial' as const,
      category: 'Financial Viability'
    }
  ];

  return (
    <div className="print-page-break print-section">
      {/* Compact Section Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center">
          <PrintIcon name="key-insights" size={20} color="white" />
        </div>
        <h2 className="print-title-2 text-emerald-800">2.0 Key Insights & Metrics</h2>
      </div>
      
      {/* Compressed Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {metricCards.map((metric, index) => (
          <div key={index} className="relative print-avoid-break">
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              {/* Compact Category Badge */}
              <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                {metric.category}
              </div>
              
              {/* Icon and Title - More Compact */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center">
                  <PrintIcon name={metric.icon} size={16} color="#475569" />
                </div>
                <div className="text-sm font-semibold text-gray-700">{metric.title}</div>
              </div>
              
              {/* Compressed Value and Progress */}
              <div className="space-y-2">
                <div 
                  className="text-lg font-black"
                  style={{ color: getMetricColor(metric.value) }}
                >
                  {metric.value}
                </div>
                
                {/* Compact Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(getMetricScore(metric.value) / 10) * 100}%`,
                      backgroundColor: getMetricColor(metric.value)
                    }}
                  />
                </div>
                
                <div className="text-xs text-gray-600">{metric.subtitle}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Compressed Market Readiness Assessment */}
      <div className="print-avoid-break">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-3 text-slate-700">
          <PrintIcon name="actions" size={16} color="#475569" />
          Market Readiness Assessment
        </h3>
        
        <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-4 border border-slate-200">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-xs font-semibold text-gray-800">Market Timing</span>
                </div>
                <span className="print-status-high text-xs">Excellent</span>
              </div>
              
              <div className="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-xs font-semibold text-gray-800">Technology Readiness</span>
                </div>
                <span className="print-status-high text-xs">Ready</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="text-xs font-semibold text-gray-800">Target Audience</span>
                </div>
                <span className="print-status-medium text-xs">Well-Defined</span>
              </div>
              
              <div className="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="text-xs font-semibold text-gray-800">Business Model</span>
                </div>
                <span className="print-status-medium text-xs">Developing</span>
              </div>
            </div>
          </div>
          
          {/* Compact Summary Insight */}
          <div className="mt-4 p-3 bg-white/70 rounded-lg border border-slate-200/50">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-slate-500 rounded-full flex items-center justify-center flex-shrink-0">
                <PrintIcon name="insight" size={12} color="white" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-800 mb-1">Strategic Insight</h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Strong market fundamentals with clear opportunity for differentiation. 
                  Focus on rapid prototype development and customer validation to capitalize on optimal market timing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintKeyInsights;
