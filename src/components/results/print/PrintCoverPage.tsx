
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

  const getConfidenceLevel = (score: number) => {
    if (score >= 8) return 'High Confidence';
    if (score >= 6) return 'Moderate Confidence';
    return 'Low Confidence';
  };

  return (
    <div className="print-cover-page min-h-screen flex flex-col justify-between p-8 relative overflow-hidden">
      {/* Modern Background with Glassmorphism */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-green-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 flex flex-col justify-between h-full">
        {/* Enhanced Header with Modern Logo */}
        <div className="print-header">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-2xl shadow-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">Validator</h3>
              <p className="text-sm text-gray-600 font-medium">AI-Powered Business Intelligence</p>
            </div>
          </div>
        </div>

        {/* Main Content with Enhanced Typography */}
        <div className="flex-1 flex flex-col justify-center text-center space-y-12">
          <div className="space-y-6">
            <div className="inline-block px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-semibold tracking-wide uppercase shadow-lg">
              Idea Validation Report
            </div>
            <h1 className="print-title-1 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent leading-tight">
              {ideaName}
            </h1>
            <p className="text-xl text-gray-600 font-medium">Comprehensive Business Idea Analysis</p>
          </div>

          {/* Enhanced Score Display with Glassmorphism */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl"></div>
            <div className="relative bg-white/30 backdrop-blur-xl rounded-3xl p-10 mx-auto max-w-lg border border-white/30 shadow-xl">
              <div className="text-center space-y-4">
                <div className="relative">
                  <div 
                    className="text-7xl font-black mb-2 bg-gradient-to-br bg-clip-text text-transparent"
                    style={{ 
                      backgroundImage: `linear-gradient(135deg, ${getScoreColor(score)}, ${getScoreColor(score)}dd)`
                    }}
                  >
                    {score.toFixed(1)}
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">✓</span>
                  </div>
                </div>
                <div className="text-lg text-gray-700 font-medium">out of 10</div>
                <div 
                  className="inline-block px-6 py-3 rounded-2xl text-sm font-bold shadow-lg"
                  style={{ 
                    backgroundColor: getScoreColor(score) + '15',
                    color: getScoreColor(score),
                    border: `2px solid ${getScoreColor(score)}30`
                  }}
                >
                  {getScoreLabel(score)}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  {getConfidenceLevel(score)}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Analysis Details */}
          <div className="space-y-3 text-gray-700">
            <div className="grid grid-cols-2 gap-6 max-w-lg mx-auto">
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-800">Analysis Date</p>
                <p className="text-lg font-bold text-blue-600">{analysisDate}</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-800">Generated</p>
                <p className="text-lg font-bold text-purple-600">{format(new Date(), 'MMM d, yyyy')}</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Document Type: Business Idea Validation</p>
            </div>
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="print-footer space-y-4">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <p className="font-bold text-red-600 text-lg tracking-wide">CONFIDENTIAL</p>
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
            <p className="text-sm text-gray-600 font-medium">This report contains proprietary and confidential information.</p>
            <p className="text-xs text-gray-500">Distribution is restricted to authorized personnel only.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintCoverPage;
