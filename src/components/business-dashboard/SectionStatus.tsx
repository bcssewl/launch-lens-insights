
import React from 'react';
import { CheckCircle, Clock, FileText, TrendingUp, DollarSign, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SectionStatusProps {
  report: any;
}

const SectionStatus: React.FC<SectionStatusProps> = ({ report }) => {
  const sections = [
    {
      id: 'validation',
      title: 'Validation Report',
      description: 'Comprehensive idea validation analysis',
      icon: CheckCircle,
      completed: true,
      actionText: 'View Report'
    },
    {
      id: 'business-plan',
      title: 'Business Plan',
      description: 'AI-generated business plan tailored to your idea',
      icon: FileText,
      completed: false,
      actionText: 'Generate Plan'
    },
    {
      id: 'marketing',
      title: 'Marketing Analysis',
      description: 'Target audience insights and marketing strategy',
      icon: TrendingUp,
      completed: false,
      actionText: 'Create Strategy'
    },
    {
      id: 'financial',
      title: 'Financial Projections',
      description: 'Revenue forecasts and funding requirements',
      icon: DollarSign,
      completed: false,
      actionText: 'View Projections'
    },
    {
      id: 'action-items',
      title: 'Action Items',
      description: 'Prioritized next steps to launch your business',
      icon: Target,
      completed: false,
      actionText: 'Get Started'
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Development Sections</h3>
      
      {sections.map((section) => {
        const Icon = section.icon;
        return (
          <div 
            key={section.id}
            className={`bg-white rounded-lg border p-6 transition-all ${
              section.completed ? 'border-green-200' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  section.completed 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className={`font-semibold mb-1 ${
                    section.completed ? 'text-gray-900' : 'text-gray-600'
                  }`}>
                    {section.title}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {section.description}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {section.completed ? (
                  <div className="flex items-center text-green-600 text-sm font-medium">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Complete
                  </div>
                ) : (
                  <div className="flex items-center text-gray-400 text-sm">
                    <Clock className="w-4 h-4 mr-1" />
                    Coming Soon
                  </div>
                )}
                
                <Button 
                  variant={section.completed ? "default" : "outline"} 
                  size="sm"
                  disabled={!section.completed}
                >
                  {section.actionText}
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SectionStatus;
