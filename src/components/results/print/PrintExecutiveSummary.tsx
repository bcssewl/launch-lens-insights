
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
        risk: "Low Risk",
        confidence: "High Confidence"
      };
    } else if (score >= 6) {
      return {
        status: "PROCEED WITH CAUTION",
        color: "#d97706",
        bgColor: "#fef3c7",
        risk: "Medium Risk",
        confidence: "Moderate Confidence"
      };
    } else {
      return {
        status: "HIGH RISK",
        color: "#dc2626",
        bgColor: "#fee2e2",
        risk: "High Risk",
        confidence: "Low Confidence"
      };
    }
  };

  const recData = getRecommendationData(recommendation, score);

  return (
    <div className="print-page-break print-section">
      <h2 className="print-title-2">Executive Summary</h2>
      
      {/* Key Findings Header */}
      <div className="print-card mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="print-title-3 mb-2">Strategic Recommendation</h3>
            <div 
              className="inline-block px-4 py-2 rounded-lg font-bold text-sm"
              style={{ 
                backgroundColor: recData.bgColor,
                color: recData.color 
              }}
            >
              {recData.status}
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold" style={{ color: recData.color }}>
              {score.toFixed(1)}/10
            </div>
            <div className="text-sm text-gray-600">Overall Score</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
          <div>
            <div className="text-sm font-medium text-gray-700">Risk Level</div>
            <div className="text-lg font-semibold" style={{ color: recData.color }}>
              {recData.risk}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700">Confidence</div>
            <div className="text-lg font-semibold" style={{ color: recData.color }}>
              {recData.confidence}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Content */}
      <div className="print-avoid-break">
        <h3 className="print-title-3">Business Concept Overview</h3>
        <p className="print-body leading-relaxed">{summary}</p>
      </div>

      {/* Detailed Recommendation */}
      <div className="print-avoid-break mt-6">
        <h3 className="print-title-3">Detailed Analysis & Recommendation</h3>
        <p className="print-body leading-relaxed">{recommendation}</p>
      </div>

      {/* Quick Facts */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg print-avoid-break">
        <h4 className="font-semibold text-gray-800 mb-3">Key Takeaways</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Primary Strength:</span>
            <span className="text-gray-600 ml-2">Market opportunity validation</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Main Challenge:</span>
            <span className="text-gray-600 ml-2">Competitive differentiation</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Next Step:</span>
            <span className="text-gray-600 ml-2">Market validation research</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Timeline:</span>
            <span className="text-gray-600 ml-2">3-6 months to MVP</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintExecutiveSummary;
