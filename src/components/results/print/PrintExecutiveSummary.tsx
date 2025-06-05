
import React from 'react';

interface PrintExecutiveSummaryProps {
  summary: string;
  recommendation: string;
  score: number;
}

const PrintExecutiveSummary: React.FC<PrintExecutiveSummaryProps> = ({
  summary,
  recommendation,
  score
}) => {
  const getRecommendationData = (rec: string, score: number) => {
    const lowerRec = rec.toLowerCase();
    
    if (score >= 8 || lowerRec.includes("proceed")) {
      return {
        status: "PROCEED",
        color: "#059669",
        bgColor: "#dcfce7",
        borderColor: "#059669",
        risk: "Low Risk",
        confidence: "High Confidence",
        icon: "🟢",
        priority: "HIGH PRIORITY"
      };
    } else if (score >= 6) {
      return {
        status: "PROCEED WITH CAUTION",
        color: "#d97706",
        bgColor: "#fef3c7",
        borderColor: "#d97706",
        risk: "Medium Risk",
        confidence: "Moderate Confidence",
        icon: "🟡",
        priority: "MEDIUM PRIORITY"
      };
    } else {
      return {
        status: "HIGH RISK",
        color: "#dc2626",
        bgColor: "#fee2e2",
        borderColor: "#dc2626",
        risk: "High Risk",
        confidence: "Low Confidence",
        icon: "🔴",
        priority: "CRITICAL REVIEW"
      };
    }
  };

  const recData = getRecommendationData(recommendation, score);

  return (
    <div className="print-page-break print-section">
      {/* Section Header with Icon */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
          <span className="text-xl">📋</span>
        </div>
        <h2 className="print-title-2 text-blue-800">1.0 Executive Summary</h2>
      </div>
      
      {/* Enhanced Strategic Recommendation Card */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg"></div>
        <div 
          className="relative p-8 rounded-2xl border-l-8"
          style={{ 
            backgroundColor: recData.bgColor,
            borderLeftColor: recData.borderColor
          }}
        >
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{recData.icon}</span>
                <h3 className="print-title-3 text-gray-800">Strategic Recommendation</h3>
              </div>
              <div 
                className="inline-block px-6 py-3 rounded-xl font-bold text-lg shadow-lg"
                style={{ 
                  backgroundColor: recData.color,
                  color: 'white'
                }}
              >
                {recData.status}
              </div>
              <div className="mt-3">
                <span 
                  className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ 
                    backgroundColor: recData.color + '20',
                    color: recData.color
                  }}
                >
                  {recData.priority}
                </span>
              </div>
            </div>
            <div className="text-right ml-6">
              <div className="bg-white rounded-2xl p-4 shadow-md">
                <div 
                  className="text-4xl font-black mb-1"
                  style={{ color: recData.color }}
                >
                  {score.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600 font-semibold">Overall Score</div>
              </div>
            </div>
          </div>
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-700 mb-1">Risk Level</div>
              <div 
                className="text-lg font-bold"
                style={{ color: recData.color }}
              >
                {recData.risk}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-700 mb-1">Confidence</div>
              <div 
                className="text-lg font-bold"
                style={{ color: recData.color }}
              >
                {recData.confidence}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-700 mb-1">Market Timing</div>
              <div className="text-lg font-bold text-green-600">
                Optimal
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Business Concept Overview */}
      <div className="print-avoid-break mb-8">
        <h3 className="print-title-3 flex items-center gap-2 mb-4">
          <span className="text-lg">🎯</span>
          Business Concept Overview
        </h3>
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <p className="print-body leading-relaxed text-gray-700">{summary}</p>
        </div>
      </div>

      {/* Detailed Analysis & Recommendation */}
      <div className="print-avoid-break mb-8">
        <h3 className="print-title-3 flex items-center gap-2 mb-4">
          <span className="text-lg">📊</span>
          Detailed Analysis & Recommendation
        </h3>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="print-body leading-relaxed text-gray-700">{recommendation}</p>
        </div>
      </div>

      {/* Enhanced Key Takeaways */}
      <div className="print-avoid-break">
        <h3 className="print-title-3 flex items-center gap-2 mb-4">
          <span className="text-lg">💡</span>
          Key Takeaways & Critical Success Factors
        </h3>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">✓</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-800">Primary Strength:</span>
                  <span className="text-gray-700 ml-2">Market opportunity validation</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">→</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-800">Next Step:</span>
                  <span className="text-gray-700 ml-2">Market validation research</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">!</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-800">Main Challenge:</span>
                  <span className="text-gray-700 ml-2">Competitive differentiation</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">⏱</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-800">Timeline:</span>
                  <span className="text-gray-700 ml-2">3-6 months to MVP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintExecutiveSummary;
