
import React from 'react';

interface PrintCompetitionAnalysisProps {
  data: {
    competitors: any[];
    competitiveAdvantages: string[];
    marketSaturation: string;
  };
}

const PrintCompetitionAnalysis: React.FC<PrintCompetitionAnalysisProps> = ({ data }) => {
  return (
    <div className="print-page-break print-section">
      <h2 className="print-title-2">Competition Analysis</h2>
      
      {/* Market Saturation */}
      <div className="print-avoid-break mb-6">
        <h3 className="print-title-3">Market Saturation Level</h3>
        <div className="print-card">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-2">
              {data.marketSaturation}
            </div>
            <p className="text-sm text-gray-600">
              The market shows moderate saturation with opportunities for differentiation
            </p>
          </div>
        </div>
      </div>

      {/* Competitive Advantages */}
      <div className="print-avoid-break mb-6">
        <h3 className="print-title-3">Our Competitive Advantages</h3>
        <div className="space-y-2">
          {data.competitiveAdvantages.length > 0 ? (
            data.competitiveAdvantages.map((advantage, index) => (
              <div key={index} className="flex items-center p-3 bg-green-50 rounded border-l-4 border-green-500">
                <span className="text-green-600 mr-2">✓</span>
                <span>{advantage}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-600 italic">No specific competitive advantages identified yet</p>
          )}
        </div>
      </div>

      {/* Competitive Positioning */}
      <div className="print-avoid-break">
        <h3 className="print-title-3">Competitive Positioning Matrix</h3>
        <div className="print-chart-container">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="print-card">
                <div className="font-semibold text-green-600">Price Advantage</div>
                <div className="text-sm text-gray-600 mt-1">Lower cost structure</div>
              </div>
              <div className="print-card">
                <div className="font-semibold text-blue-600">Feature Differentiation</div>
                <div className="text-sm text-gray-600 mt-1">Unique value proposition</div>
              </div>
              <div className="print-card">
                <div className="font-semibold text-purple-600">Market Focus</div>
                <div className="text-sm text-gray-600 mt-1">Niche targeting</div>
              </div>
            </div>
            <p className="text-sm text-gray-600 text-center italic">
              Recommended strategy: Focus on feature differentiation and niche market targeting
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintCompetitionAnalysis;
