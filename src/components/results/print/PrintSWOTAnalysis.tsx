
import React from 'react';

interface PrintSWOTAnalysisProps {
  data: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
}

const PrintSWOTAnalysis: React.FC<PrintSWOTAnalysisProps> = ({ data }) => {
  const swotSections = [
    {
      title: 'Strengths',
      items: data.strengths,
      color: '#059669',
      bgColor: '#dcfce7',
      icon: '💪'
    },
    {
      title: 'Weaknesses', 
      items: data.weaknesses,
      color: '#dc2626',
      bgColor: '#fee2e2',
      icon: '⚠️'
    },
    {
      title: 'Opportunities',
      items: data.opportunities,
      color: '#2563eb',
      bgColor: '#dbeafe',
      icon: '🚀'
    },
    {
      title: 'Threats',
      items: data.threats,
      color: '#d97706',
      bgColor: '#fef3c7',
      icon: '⚡'
    }
  ];

  return (
    <div className="print-section">
      <h2 className="print-title-2">SWOT Analysis</h2>
      
      <div className="print-grid-2">
        {swotSections.map((section, index) => (
          <div 
            key={index} 
            className="print-card"
            style={{ 
              backgroundColor: section.bgColor,
              borderColor: section.color + '50'
            }}
          >
            <div className="flex items-center mb-3">
              <span className="text-lg mr-2">{section.icon}</span>
              <h3 
                className="font-semibold text-lg"
                style={{ color: section.color }}
              >
                {section.title}
              </h3>
            </div>
            <ul className="space-y-2">
              {section.items.length > 0 ? (
                section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="text-sm flex items-start">
                    <span className="mr-2 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-sm text-gray-500 italic">
                  No {section.title.toLowerCase()} identified
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrintSWOTAnalysis;
