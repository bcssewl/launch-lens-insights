
import React from 'react';
import PrintIcon from './PrintIcon';

const PrintTableOfContents: React.FC = () => {
  const sections = [
    { 
      number: '1.0',
      title: 'Executive Summary', 
      page: 3,
      icon: 'executive-summary' as const,
      description: 'Strategic overview and key recommendations'
    },
    { 
      number: '2.0',
      title: 'Key Insights & Metrics', 
      page: 4,
      icon: 'key-insights' as const,
      description: 'Critical business metrics and readiness assessment'
    },
    { 
      number: '3.0',
      title: 'Market Analysis', 
      page: 5,
      icon: 'market-analysis' as const,
      description: 'TAM/SAM/SOM, growth trends, and customer segments'
    },
    { 
      number: '4.0',
      title: 'Competition Analysis', 
      page: 7,
      icon: 'competition' as const,
      description: 'Competitive landscape and positioning strategy'
    },
    { 
      number: '5.0',
      title: 'Financial Analysis', 
      page: 9,
      icon: 'financial' as const,
      description: 'Investment requirements and revenue projections'
    },
    { 
      number: '6.0',
      title: 'SWOT Analysis', 
      page: 11,
      icon: 'swot' as const,
      description: 'Strengths, weaknesses, opportunities, and threats'
    },
    { 
      number: '7.0',
      title: 'Detailed Score Breakdown', 
      page: 12,
      icon: 'detailed-scores' as const,
      description: 'Comprehensive scoring across all evaluation criteria'
    },
    { 
      number: '8.0',
      title: 'Recommended Actions', 
      page: 13,
      icon: 'actions' as const,
      description: 'Prioritized action plan and implementation timeline'
    },
  ];

  return (
    <div className="print-page-break print-section relative">
      {/* Modern Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
          <PrintIcon name="reading-guide" size={24} color="white" />
        </div>
        <h2 className="print-title-2 text-slate-800">Table of Contents</h2>
      </div>
      
      {/* Enhanced TOC with Modern Design */}
      <div className="space-y-4 mt-8">
        {sections.map((section, index) => (
          <div key={index} className="group">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center">
                  <PrintIcon name={section.icon} size={18} color="#475569" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-600 text-sm">{section.number}</span>
                    <span className="font-semibold text-gray-800">{section.title}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{section.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-semibold">
                  Page {section.page}
                </div>
              </div>
            </div>
            {/* Dotted line connector */}
            {index < sections.length - 1 && (
              <div className="ml-9 w-px h-4 bg-gradient-to-b from-gray-300 to-transparent"></div>
            )}
          </div>
        ))}
      </div>
      
      {/* Enhanced Reading Guide */}
      <div className="mt-12 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl"></div>
        <div className="relative p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg flex items-center justify-center">
              <PrintIcon name="reading-guide" size={16} color="white" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">How to Read This Report</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-sm text-slate-700">Scores rated 1-10 (10 = highest)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-sm text-slate-700">Green indicators = positive factors</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span className="text-sm text-slate-700">Yellow indicators = attention required</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-slate-700">Red indicators = high-risk factors</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                <span className="text-sm text-slate-700">Actions prioritized by impact</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                <span className="text-sm text-slate-700">Charts optimized for insights</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintTableOfContents;
