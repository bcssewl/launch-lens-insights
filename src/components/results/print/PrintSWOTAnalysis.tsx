import React from 'react';
import PrintIcon from './PrintIcon';

interface PrintSWOTAnalysisProps {
  data: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
}

const PrintSWOTAnalysis: React.FC<PrintSWOTAnalysisProps> = ({ data }) => {
  // Truncate items to 1-2 lines and merge related points
  const truncateItems = (items: string[], maxItems: number = 5) => {
    return items.slice(0, maxItems).map(item => {
      // Keep items concise - max 70 characters
      return item.length > 70 ? item.substring(0, 67) + '...' : item;
    });
  };

  const swotSections = [
    {
      title: 'Strengths',
      items: truncateItems(data.strengths),
      color: '#059669',
      bgColor: '#ecfdf5',
      borderColor: '#34d399',
      icon: 'strengths' as const
    },
    {
      title: 'Weaknesses', 
      items: truncateItems(data.weaknesses),
      color: '#dc2626',
      bgColor: '#fef2f2',
      borderColor: '#f87171',
      icon: 'weaknesses' as const
    },
    {
      title: 'Opportunities',
      items: truncateItems(data.opportunities),
      color: '#2563eb',
      bgColor: '#eff6ff',
      borderColor: '#60a5fa',
      icon: 'opportunities' as const
    },
    {
      title: 'Threats',
      items: truncateItems(data.threats),
      color: '#d97706',
      bgColor: '#fffbeb',
      borderColor: '#fbbf24',
      icon: 'threats' as const
    }
  ];

  return (
    <div className="print-section">
      {/* Section Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
          <PrintIcon name="swot" size={24} color="white" />
        </div>
        <h2 className="print-title-2 text-slate-800">6.0 SWOT Analysis</h2>
      </div>
      
      {/* Clean 2x2 Grid Layout */}
      <div className="grid grid-cols-2 gap-6 print-avoid-break">
        {swotSections.map((section, index) => (
          <div 
            key={index} 
            className="relative rounded-xl border-2 overflow-hidden"
            style={{ 
              backgroundColor: section.bgColor,
              borderColor: section.borderColor
            }}
          >
            {/* Header with Icon */}
            <div 
              className="p-4 border-b-2"
              style={{ 
                backgroundColor: section.color + '10',
                borderColor: section.borderColor
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: section.color }}>
                  <PrintIcon name={section.icon} size={16} color="white" />
                </div>
                <h3 
                  className="font-bold text-lg"
                  style={{ color: section.color }}
                >
                  {section.title}
                </h3>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {section.items.length > 0 ? (
                <ul className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-sm flex items-start leading-tight">
                      <span 
                        className="mr-2 mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: section.color }}
                      ></span>
                      <span className="text-gray-800">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No {section.title.toLowerCase()} identified
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Strategic Summary */}
      <div className="mt-8 print-avoid-break">
        <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-6 border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
              <PrintIcon name="insight" size={16} color="white" />
            </div>
            <h4 className="font-bold text-slate-800">Strategic SWOT Summary</h4>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h5 className="font-semibold text-emerald-700 mb-2">Leverage Strengths & Opportunities</h5>
              <p className="text-sm text-gray-700">
                Build on market timing advantages and strong value proposition to capture emerging opportunities.
              </p>
            </div>
            <div>
              <h5 className="font-semibold text-red-700 mb-2">Address Weaknesses & Threats</h5>
              <p className="text-sm text-gray-700">
                Prioritize competitive differentiation and resource optimization to mitigate identified risks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintSWOTAnalysis;
