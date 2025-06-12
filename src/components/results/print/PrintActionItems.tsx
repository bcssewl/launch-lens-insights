
import React from 'react';

interface PrintActionItemsProps {
  items: any[];
}

const PrintActionItems: React.FC<PrintActionItemsProps> = ({ items }) => {
  const priorityColors = {
    'High': '#dc2626',
    'Medium': '#d97706', 
    'Low': '#059669'
  };

  const timelineColors = {
    'Immediate': '#dc2626',
    'Short-term': '#d97706',
    'Medium-term': '#2563eb',
    'Long-term': '#059669'
  };

  return (
    <div className="print-section">
      <h2 className="print-title-2">Recommended Actions</h2>
      
      {items.length > 0 ? (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="print-card print-avoid-break">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold text-gray-800 flex-1 pr-4">
                  {item.title || `Action Item ${index + 1}`}
                </h4>
                <div className="flex gap-2 flex-shrink-0">
                  {item.priority && (
                    <span 
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{ 
                        backgroundColor: priorityColors[item.priority as keyof typeof priorityColors] + '20',
                        color: priorityColors[item.priority as keyof typeof priorityColors]
                      }}
                    >
                      {item.priority} Priority
                    </span>
                  )}
                  {item.timeline && (
                    <span 
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{ 
                        backgroundColor: timelineColors[item.timeline as keyof typeof timelineColors] + '20',
                        color: timelineColors[item.timeline as keyof typeof timelineColors]
                      }}
                    >
                      {item.timeline}
                    </span>
                  )}
                </div>
              </div>
              
              {item.description && (
                <p className="text-sm text-gray-600 mb-3">{item.description}</p>
              )}
              
              {item.steps && item.steps.length > 0 && (
                <div>
                  <div className="font-medium text-sm text-gray-700 mb-2">Implementation Steps:</div>
                  <ol className="text-sm text-gray-600 space-y-1">
                    {item.steps.map((step: string, stepIndex: number) => (
                      <li key={stepIndex} className="flex items-start">
                        <span className="mr-2 font-medium">{stepIndex + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              
              {item.resources && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="font-medium text-sm text-gray-700 mb-1">Required Resources:</div>
                  <p className="text-sm text-gray-600">{item.resources}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="print-card">
          <h4 className="font-semibold text-gray-800 mb-3">Priority Action Items</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>1. Conduct detailed market research</span>
              <span className="print-status-high">High Priority</span>
            </div>
            <div className="flex justify-between items-center">
              <span>2. Develop minimum viable product (MVP)</span>
              <span className="print-status-high">High Priority</span>
            </div>
            <div className="flex justify-between items-center">
              <span>3. Validate with target customers</span>
              <span className="print-status-medium">Medium Priority</span>
            </div>
            <div className="flex justify-between items-center">
              <span>4. Secure initial funding</span>
              <span className="print-status-medium">Medium Priority</span>
            </div>
            <div className="flex justify-between items-center">
              <span>5. Build strategic partnerships</span>
              <span className="print-status-low">Low Priority</span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 print-card">
        <h4 className="font-semibold text-gray-800 mb-3">Implementation Timeline</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">Phase 1 (Month 1-2)</span>
            <span className="text-red-600">Market Research & Validation</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Phase 2 (Month 3-4)</span>
            <span className="text-orange-600">MVP Development</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Phase 3 (Month 5-6)</span>
            <span className="text-blue-600">Testing & Iteration</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Phase 4 (Month 7+)</span>
            <span className="text-green-600">Launch & Scale</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintActionItems;
