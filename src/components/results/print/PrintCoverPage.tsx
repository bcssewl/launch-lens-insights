
import React from 'react';
import { format } from 'date-fns';

interface PrintCoverPageProps {
  ideaName: string;
  score: number;
  analysisDate: string;
}

const PrintCoverPage: React.FC<PrintCoverPageProps> = ({
  ideaName,
  score,
  analysisDate
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 8) return '#059669'; // Green
    if (score >= 6) return '#d97706'; // Orange
    return '#dc2626'; // Red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Highly Recommended';
    if (score >= 6) return 'Proceed with Caution';
    return 'High Risk - Consider Pivoting';
  };

  return (
    <div className="print-page-break h-screen flex flex-col justify-between p-8">
      {/* Header with Logo Space */}
      <div className="print-header">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-600">Idea Validation Report</h3>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center text-center space-y-8">
        <div>
          <h1 className="print-title-1 mb-6">{ideaName}</h1>
          <p className="text-lg text-gray-600 mb-8">Comprehensive Business Idea Analysis</p>
        </div>

        {/* Score Display */}
        <div className="bg-gray-50 rounded-2xl p-8 mx-auto max-w-md">
          <div className="text-center">
            <div 
              className="text-6xl font-bold mb-2"
              style={{ color: getScoreColor(score) }}
            >
              {score.toFixed(1)}
            </div>
            <div className="text-lg text-gray-600 mb-2">out of 10</div>
            <div 
              className="inline-block px-4 py-2 rounded-full text-sm font-medium"
              style={{ 
                backgroundColor: getScoreColor(score) + '20',
                color: getScoreColor(score)
              }}
            >
              {getScoreLabel(score)}
            </div>
          </div>
        </div>

        {/* Analysis Details */}
        <div className="space-y-2 text-gray-600">
          <p><strong>Analysis Date:</strong> {analysisDate}</p>
          <p><strong>Report Generated:</strong> {format(new Date(), 'MMM d, yyyy')}</p>
          <p><strong>Document Type:</strong> Business Idea Validation</p>
        </div>
      </div>

      {/* Footer */}
      <div className="print-footer space-y-2">
        <div className="text-center text-sm">
          <p className="font-medium text-red-600">CONFIDENTIAL</p>
          <p>This report contains proprietary and confidential information.</p>
          <p>Distribution is restricted to authorized personnel only.</p>
        </div>
      </div>
    </div>
  );
};

export default PrintCoverPage;
