
import React from 'react';

const PrintTableOfContents: React.FC = () => {
  const sections = [
    { title: 'Executive Summary', page: 3 },
    { title: 'Key Insights & Metrics', page: 4 },
    { title: 'Market Analysis', page: 5 },
    { title: 'Competition Analysis', page: 7 },
    { title: 'Financial Analysis', page: 9 },
    { title: 'SWOT Analysis', page: 11 },
    { title: 'Detailed Score Breakdown', page: 12 },
    { title: 'Recommended Actions', page: 13 },
  ];

  return (
    <div className="print-page-break print-section">
      <h2 className="print-title-2">Table of Contents</h2>
      
      <div className="space-y-3 mt-8">
        {sections.map((section, index) => (
          <div key={index} className="flex justify-between items-center border-b border-gray-200 pb-2">
            <span className="font-medium text-gray-700">{section.title}</span>
            <span className="text-gray-500">Page {section.page}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-12 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2">How to Read This Report</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Scores are rated on a scale of 1-10 (10 being the highest)</li>
          <li>• Green indicators suggest positive factors</li>
          <li>• Yellow indicators suggest areas requiring attention</li>
          <li>• Red indicators suggest high-risk factors</li>
          <li>• Action items are prioritized by impact and feasibility</li>
        </ul>
      </div>
    </div>
  );
};

export default PrintTableOfContents;
