
import React from 'react';
import PrintIcon from './PrintIcon';

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
        bgColor: "#ecfdf5",
        borderColor: "#059669",
        risk: "Low Risk",
        confidence: "High Confidence",
        priority: "HIGH PRIORITY"
      };
    } else if (score >= 6) {
      return {
        status: "PROCEED WITH CAUTION",
        color: "#d97706",
        bgColor: "#fffbeb",
        borderColor: "#d97706",
        risk: "Medium Risk",
        confidence: "Moderate Confidence",
        priority: "MEDIUM PRIORITY"
      };
    } else {
      return {
        status: "HIGH RISK",
        color: "#dc2626",
        bgColor: "#fef2f2",
        borderColor: "#dc2626",
        risk: "High Risk",
        confidence: "Low Confidence",
        priority: "CRITICAL REVIEW"
      };
    }
  };

  const recData = getRecommendationData(recommendation, score);

  return (
    <div className="print-page-break print-section">
      {/* Compact Section Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
          <PrintIcon name="executive-summary" size={20} color="white" />
        </div>
        <h2 className="print-title-2 text-slate-800">1.0 Executive Summary</h2>
      </div>
      
      {/* Compressed Strategic Recommendation Card */}
      <div className="relative mb-4">
        <div 
          className="p-4 rounded-xl border-l-6"
          style={{ 
            backgroundColor: recData.bgColor,
            borderLeftColor: recData.borderColor
          }}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <PrintIcon name="insight" size={14} color={recData.color} />
                </div>
                <h3 className="text-sm font-semibold text-gray-800">Strategic Recommendation</h3>
              </div>
              <div 
                className="inline-block px-4 py-2 rounded-lg font-bold text-sm shadow-md"
                style={{ 
                  backgroundColor: recData.color,
                  color: 'white'
                }}
              >
                {recData.status}
              </div>
              <div className="mt-2">
                <span 
                  className="inline-block px-2 py-1 rounded-full text-xs font-semibold"
                  style={{ 
                    backgroundColor: recData.color + '20',
                    color: recData.color
                  }}
                >
                  {recData.priority}
                </span>
              </div>
            </div>
            <div className="text-right ml-4">
              <div className="bg-white rounded-xl p-3 shadow-md">
                <div 
                  className="text-2xl font-black mb-1"
                  style={{ color: recData.color }}
                >
                  {score.toFixed(1)}
                </div>
                <div className="text-xs text-gray-600 font-semibold">Overall Score</div>
              </div>
            </div>
          </div>
          
          {/* Compact Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-200">
            <div className="text-center">
              <div className="text-xs font-semibold text-gray-700 mb-1">Risk Level</div>
              <div 
                className="text-sm font-bold"
                style={{ color: recData.color }}
              >
                {recData.risk}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs font-semibold text-gray-700 mb-1">Confidence</div>
              <div 
                className="text-sm font-bold"
                style={{ color: recData.color }}
              >
                {recData.confidence}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs font-semibold text-gray-700 mb-1">Market Timing</div>
              <div className="text-sm font-bold text-emerald-600">
                Optimal
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Consolidated Analysis Section */}
      <div className="print-avoid-break mb-4">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-3 text-slate-700">
          <PrintIcon name="market-analysis" size={16} color="#475569" />
          Business Analysis & Recommendation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="text-xs font-semibold text-gray-700 mb-2">Business Concept</h4>
            <p className="text-xs leading-relaxed text-gray-700">{summary}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <h4 className="text-xs font-semibold text-gray-700 mb-2">Detailed Recommendation</h4>
            <p className="text-xs leading-relaxed text-gray-700">{recommendation}</p>
          </div>
        </div>
      </div>

      {/* Compact Key Takeaways */}
      <div className="print-avoid-break">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-3 text-slate-700">
          <PrintIcon name="insight" size={16} color="#475569" />
          Key Takeaways & Critical Success Factors
        </h3>
        <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-4 border border-slate-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <PrintIcon name="strengths" size={12} color="white" />
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-800 block">Primary Strength</span>
                <span className="text-xs text-gray-600">Market opportunity validation</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-slate-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <PrintIcon name="actions" size={12} color="white" />
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-800 block">Next Step</span>
                <span className="text-xs text-gray-600">Market validation research</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <PrintIcon name="weaknesses" size={12} color="white" />
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-800 block">Main Challenge</span>
                <span className="text-xs text-gray-600">Competitive differentiation</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <PrintIcon name="detailed-scores" size={12} color="white" />
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-800 block">Timeline</span>
                <span className="text-xs text-gray-600">3-6 months to MVP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintExecutiveSummary;
