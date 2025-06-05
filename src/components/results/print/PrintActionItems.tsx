
import React from 'react';
import PrintIcon from './PrintIcon';

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
      {/* Section Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
          <PrintIcon name="actions" size={24} color="white" />
        </div>
        <h2 className="print-title-2 text-slate-800">8.0 Recommended Actions</h2>
      </div>
      
      {items.length > 0 ? (
        <div className="space-y-4 mb-8">
          {items.map((item, index) => (
            <div key={index} className="print-card print-avoid-break bg-white border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3 flex-1 pr-4">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                    <PrintIcon name="actions" size={16} color="#64748b" />
                  </div>
                  <h4 className="font-semibold text-gray-800">
                    {item.title || `Action Item ${index + 1}`}
                  </h4>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {item.priority && (
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-medium"
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
                      className="px-3 py-1 rounded-full text-xs font-medium"
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
                <p className="text-sm text-gray-600 mb-4">{item.description}</p>
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
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <PrintIcon name="financial" size={14} color="#64748b" />
                    <div className="font-medium text-sm text-gray-700">Required Resources:</div>
                  </div>
                  <p className="text-sm text-gray-600">{item.resources}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="print-card bg-white border border-gray-200 shadow-sm mb-8">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <PrintIcon name="actions" size={18} color="#64748b" />
            Priority Action Items
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-800">1. Conduct detailed market research</span>
              <span className="print-status-high">High Priority</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-800">2. Develop minimum viable product (MVP)</span>
              <span className="print-status-high">High Priority</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-800">3. Validate with target customers</span>
              <span className="print-status-medium">Medium Priority</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-800">4. Secure initial funding</span>
              <span className="print-status-medium">Medium Priority</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-800">5. Build strategic partnerships</span>
              <span className="print-status-low">Low Priority</span>
            </div>
          </div>
        </div>
      )}

      <div className="print-avoid-break">
        <h4 className="print-title-3 flex items-center gap-2 mb-4">
          <PrintIcon name="detailed-scores" size={18} color="#475569" />
          Implementation Timeline
        </h4>
        <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-6 border border-slate-200">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <PrintIcon name="actions" size={16} color="#dc2626" />
                <span className="font-medium text-gray-800">Phase 1 (Month 1-2)</span>
              </div>
              <span className="text-red-600 font-semibold">Market Research & Validation</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <PrintIcon name="opportunities" size={16} color="#d97706" />
                <span className="font-medium text-gray-800">Phase 2 (Month 3-4)</span>
              </div>
              <span className="text-amber-600 font-semibold">MVP Development</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <PrintIcon name="detailed-scores" size={16} color="#2563eb" />
                <span className="font-medium text-gray-800">Phase 3 (Month 5-6)</span>
              </div>
              <span className="text-blue-600 font-semibold">Testing & Iteration</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <PrintIcon name="strengths" size={16} color="#059669" />
                <span className="font-medium text-gray-800">Phase 4 (Month 7+)</span>
              </div>
              <span className="text-emerald-600 font-semibold">Launch & Scale</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintActionItems;
