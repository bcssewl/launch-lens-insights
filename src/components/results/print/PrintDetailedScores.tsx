
import React from 'react';
import PrintIcon from './PrintIcon';

interface PrintDetailedScoresProps {
  scores: { category: string; score: number }[];
}

const PrintDetailedScores: React.FC<PrintDetailedScoresProps> = ({ scores }) => {
  const getScoreColor = (score: number) => {
    if (score >= 8) return '#059669';
    if (score >= 6) return '#d97706';
    return '#dc2626';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="print-section">
      {/* Section Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
          <PrintIcon name="detailed-scores" size={24} color="white" />
        </div>
        <h2 className="print-title-2 text-slate-800">7.0 Detailed Score Breakdown</h2>
      </div>
      
      <div className="space-y-4 mb-8">
        {scores.map((item, index) => (
          <div key={index} className="print-avoid-break">
            <div className="flex justify-between items-center mb-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <PrintIcon name="key-insights" size={16} color="#64748b" />
                </div>
                <span className="font-medium text-gray-800">{item.category}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 font-medium">
                  {getScoreLabel(item.score)}
                </span>
                <span 
                  className="font-bold text-lg"
                  style={{ color: getScoreColor(item.score) }}
                >
                  {item.score.toFixed(1)}/10
                </span>
              </div>
            </div>
            <div className="px-4">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="h-3 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(item.score / 10) * 100}%`,
                    backgroundColor: getScoreColor(item.score)
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="print-avoid-break">
        <h3 className="print-title-3 flex items-center gap-2 mb-4">
          <PrintIcon name="insight" size={18} color="#475569" />
          Score Interpretation Guide
        </h3>
        <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-6 border border-slate-200">
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                  <PrintIcon name="strengths" size={10} color="white" />
                </div>
                <div>
                  <span className="font-medium text-gray-800">8.0 - 10.0: Excellent</span>
                  <p className="text-gray-600">Strong competitive advantage</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                  <PrintIcon name="opportunities" size={10} color="white" />
                </div>
                <div>
                  <span className="font-medium text-gray-800">6.0 - 7.9: Good</span>
                  <p className="text-gray-600">Above average performance</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-amber-600 rounded-full flex items-center justify-center">
                  <PrintIcon name="weaknesses" size={10} color="white" />
                </div>
                <div>
                  <span className="font-medium text-gray-800">4.0 - 5.9: Fair</span>
                  <p className="text-gray-600">Needs improvement</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <PrintIcon name="threats" size={10} color="white" />
                </div>
                <div>
                  <span className="font-medium text-gray-800">0.0 - 3.9: Poor</span>
                  <p className="text-gray-600">Significant risks present</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintDetailedScores;
