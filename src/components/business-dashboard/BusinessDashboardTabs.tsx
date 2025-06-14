
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, FileText, TrendingUp, DollarSign, Target } from 'lucide-react';
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
      <TabsList className="inline-flex h-auto items-center justify-start rounded-lg bg-muted/50 p-1 text-muted-foreground w-auto">
        {tabs.map((tab) => (
          <TabsTrigger 
            key={tab.id} 
            value={tab.id} 
            className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm whitespace-nowrap"
          >
            <div className={`w-2 h-2 rounded-full ${
              tab.completed 
                ? 'bg-green-500' 
                : 'bg-muted-foreground/30'
            }`} />
            <span>{tab.label}</span>
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
