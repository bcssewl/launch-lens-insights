
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
      icon: '📊',
      category: 'Market Opportunity'
    },
    {
      title: 'Competition Level',
      value: metrics.competitionLevel.value,
      subtitle: metrics.competitionLevel.subValue || 'Competitive intensity',
      icon: '⚔️',
      category: 'Competitive Landscape'
    },
    {
      title: 'Problem Clarity',
      value: metrics.problemClarity.value,
      subtitle: 'Market need validation',
      icon: '🎯',
      category: 'Problem-Solution Fit'
    },
    {
      title: 'Revenue Potential',
      value: metrics.revenuePotential.value,
      subtitle: 'Monetization opportunity',
      icon: '💰',
      category: 'Financial Viability'
    }
  ];

  return (
    <div className="print-section">
      {/* Section Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
          <span className="text-xl">📈</span>
        </div>
        <h2 className="print-title-2 text-green-800">2.0 Key Insights & Metrics</h2>
      </div>
      
      {/* Enhanced Metrics Grid */}
      <div className="grid grid-cols-2 gap-6 mb-10">
        {metricCards.map((metric, index) => (
          <div key={index} className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
              {/* Category Badge */}
              <div className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                {metric.category}
              </div>
              
              {/* Icon and Title */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                  <span className="text-lg">{metric.icon}</span>
                </div>
                <div className="text-sm font-semibold text-gray-700">{metric.title}</div>
              </div>
              
              {/* Value with Color and Progress */}
              <div className="space-y-3">
                <div 
                  className="text-2xl font-black"
                  style={{ color: getMetricColor(metric.value) }}
                >
                  {metric.value}
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-500"
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

      {/* Enhanced Market Readiness Assessment */}
      <div className="print-avoid-break">
        <h3 className="print-title-3 flex items-center gap-2 mb-6">
          <span className="text-lg">🚀</span>
          Market Readiness Assessment
        </h3>
        
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-semibold text-gray-800">Market Timing</span>
                </div>
                <span className="print-status-high text-xs">Excellent</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-semibold text-gray-800">Technology Readiness</span>
                </div>
                <span className="print-status-high text-xs">Ready</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="font-semibold text-gray-800">Target Audience</span>
                </div>
                <span className="print-status-medium text-xs">Well-Defined</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="font-semibold text-gray-800">Business Model</span>
                </div>
                <span className="print-status-medium text-xs">Developing</span>
              </div>
            </div>
          </div>
          
          {/* Summary Insight */}
          <div className="mt-6 p-4 bg-white/70 rounded-xl border border-blue-200/50">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs">💡</span>
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 mb-1">Strategic Insight</h4>
                <p className="text-sm text-blue-700">
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
