
import React from 'react';

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
      <h2 className="print-title-2">Detailed Score Breakdown</h2>
      
      <div className="space-y-4">
        {scores.map((item, index) => (
          <div key={index} className="print-avoid-break">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">{item.category}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
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
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full"
                style={{ 
                  width: `${(item.score / 10) * 100}%`,
                  backgroundColor: getScoreColor(item.score)
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 print-card">
        <h3 className="font-semibold mb-3">Score Interpretation Guide</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="flex items-center mb-1">
              <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
              <span className="font-medium">8.0 - 10.0: Excellent</span>
            </div>
            <p className="text-gray-600 ml-5">Strong competitive advantage</p>
          </div>
          <div>
            <div className="flex items-center mb-1">
              <div className="w-3 h-3 bg-orange-500 rounded mr-2"></div>
              <span className="font-medium">6.0 - 7.9: Good</span>
            </div>
            <p className="text-gray-600 ml-5">Above average performance</p>
          </div>
          <div>
            <div className="flex items-center mb-1">
              <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
              <span className="font-medium">4.0 - 5.9: Fair</span>
            </div>
            <p className="text-gray-600 ml-5">Needs improvement</p>
          </div>
          <div>
            <div className="flex items-center mb-1">
              <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
              <span className="font-medium">0.0 - 3.9: Poor</span>
            </div>
            <p className="text-gray-600 ml-5">Significant risks present</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintDetailedScores;
