
import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';

interface ProgressTrackerProps {
  completedSections: number;
  totalSections: number;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ completedSections, totalSections }) => {
  const progressPercentage = (completedSections / totalSections) * 100;
  
  const sections = [
    { id: 1, label: 'Validation Report', completed: true },
    { id: 2, label: 'Business Plan', completed: false },
    { id: 3, label: 'Marketing Analysis', completed: false },
    { id: 4, label: 'Financial Projections', completed: false },
    { id: 5, label: 'Action Items', completed: false },
  ];

  return (
    <div className="bg-white rounded-lg border p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Progress</h3>
        <span className="text-sm text-gray-600">{completedSections} of {totalSections} sections complete</span>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div 
          className="bg-green-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Section Steps */}
      <div className="flex justify-between">
        {sections.map((section, index) => (
          <div key={section.id} className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
              section.completed 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 text-gray-400'
            }`}>
              {section.completed ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Clock className="w-4 h-4" />
              )}
            </div>
            <span className={`text-xs text-center max-w-16 ${
              section.completed ? 'text-gray-900' : 'text-gray-500'
            }`}>
              {section.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressTracker;
