
import React from 'react';
import PrintIcon from './PrintIcon';

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
      {/* Section Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
          <PrintIcon name="competition" size={24} color="white" />
        </div>
        <h2 className="print-title-2 text-slate-800">4.0 Competition Analysis</h2>
      </div>

      {/* Competitive Advantages */}
      <div className="print-avoid-break mb-8">
        <h3 className="print-title-3 flex items-center gap-2 mb-4">
          <PrintIcon name="strengths" size={18} color="#475569" />
          Our Competitive Advantages
        </h3>
        <div className="space-y-3">
          {data.competitiveAdvantages.length > 0 ? (
            data.competitiveAdvantages.map((advantage, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <PrintIcon name="strengths" size={14} color="white" />
                </div>
                <span className="text-gray-800">{advantage}</span>
              </div>
            ))
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-600 italic">No specific competitive advantages identified yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Competitive Positioning */}
      <div className="print-avoid-break">
        <h3 className="print-title-3 flex items-center gap-2 mb-4">
          <PrintIcon name="market-analysis" size={18} color="#475569" />
          Competitive Positioning Matrix
        </h3>
        <div className="print-chart-container">
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="print-card bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <PrintIcon name="financial" size={16} color="#059669" />
                  <div className="font-semibold text-emerald-700">Price Advantage</div>
                </div>
                <div className="text-sm text-emerald-600">Lower cost structure</div>
              </div>
              <div className="print-card bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <PrintIcon name="opportunities" size={16} color="#475569" />
                  <div className="font-semibold text-slate-700">Feature Differentiation</div>
                </div>
                <div className="text-sm text-slate-600">Unique value proposition</div>
              </div>
              <div className="print-card bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <PrintIcon name="market-analysis" size={16} color="#7c3aed" />
                  <div className="font-semibold text-violet-700">Market Focus</div>
                </div>
                <div className="text-sm text-violet-600">Niche targeting</div>
              </div>
            </div>
            
            {/* Strategic Recommendation */}
            <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-6 border border-slate-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                  <PrintIcon name="insight" size={16} color="white" />
                </div>
                <h4 className="font-semibold text-slate-800">Recommended Strategy</h4>
              </div>
              <p className="text-sm text-slate-700">
                Focus on feature differentiation and niche market targeting to establish a strong competitive position. 
                Leverage unique capabilities to avoid direct price competition while building customer loyalty.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintCompetitionAnalysis;
