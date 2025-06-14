
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Clock, FileText, TrendingUp, DollarSign, Target } from 'lucide-react';
import ValidationReportTab from '@/components/business-dashboard/ValidationReportTab';
import ComingSoonTab from '@/components/business-dashboard/ComingSoonTab';

interface BusinessDashboardTabsProps {
  report: any;
}

const BusinessDashboardTabs: React.FC<BusinessDashboardTabsProps> = ({ report }) => {
  const tabs = [
    {
      id: 'validation',
      label: 'Validation Report',
      icon: CheckCircle,
      completed: true,
      description: 'View your comprehensive idea validation analysis'
    },
    {
      id: 'business-plan',
      label: 'Business Plan',
      icon: FileText,
      completed: false,
      description: 'AI-generated business plan tailored to your validated idea'
    },
    {
      id: 'marketing',
      label: 'Marketing Analysis',
      icon: TrendingUp,
      completed: false,
      description: 'Target audience insights and marketing strategy recommendations'
    },
    {
      id: 'financial',
      label: 'Financial Projections',
      icon: DollarSign,
      completed: false,
      description: 'Revenue forecasts, cost analysis, and funding requirements'
    },
    {
      id: 'action-items',
      label: 'Action Items',
      icon: Target,
      completed: false,
      description: 'Prioritized next steps to launch your business'
    }
  ];

  return (
    <Tabs defaultValue="validation" className="w-full">
      <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto p-1">
        {tabs.map((tab) => (
          <TabsTrigger 
            key={tab.id} 
            value={tab.id} 
            className="flex flex-col items-center gap-1 p-3 h-auto text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <div className="flex items-center gap-2">
              {tab.completed ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Clock className="w-4 h-4 text-muted-foreground" />
              )}
              <tab.icon className="w-4 h-4" />
            </div>
            <span className="text-center leading-tight">{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="mt-6">
        <TabsContent value="validation" className="mt-0">
          <ValidationReportTab report={report} />
        </TabsContent>
        
        <TabsContent value="business-plan" className="mt-0">
          <ComingSoonTab 
            title="Business Plan Generation"
            description="Get a comprehensive AI-generated business plan based on your validated idea. This will include executive summary, market analysis, operations plan, and more."
            features={[
              "Executive Summary",
              "Market Analysis & Strategy", 
              "Operations & Management Plan",
              "Financial Planning & Projections",
              "Risk Analysis & Mitigation"
            ]}
          />
        </TabsContent>
        
        <TabsContent value="marketing" className="mt-0">
          <ComingSoonTab 
            title="Marketing Analysis & Strategy"
            description="Discover your target audience and get personalized marketing recommendations to reach your ideal customers effectively."
            features={[
              "Target Audience Profiling",
              "Competitor Marketing Analysis",
              "Channel Recommendations",
              "Content Strategy Ideas",
              "Budget & Timeline Planning"
            ]}
          />
        </TabsContent>
        
        <TabsContent value="financial" className="mt-0">
          <ComingSoonTab 
            title="Financial Projections & Analysis"
            description="Get detailed financial forecasts and understand the investment requirements for your business idea."
            features={[
              "Revenue & Growth Projections",
              "Cost Structure Analysis",
              "Break-even Analysis",
              "Funding Requirements",
              "ROI Calculations"
            ]}
          />
        </TabsContent>
        
        <TabsContent value="action-items" className="mt-0">
          <ComingSoonTab 
            title="Actionable Next Steps"
            description="Get a prioritized roadmap of specific actions to take your validated idea from concept to launch."
            features={[
              "Prioritized Task List",
              "Timeline & Milestones",
              "Resource Requirements",
              "Success Metrics",
              "Risk Checkpoints"
            ]}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default BusinessDashboardTabs;
