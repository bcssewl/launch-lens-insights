
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
      {/* Enhanced Tab Navigation */}
      <div className="border-b border-muted/30 px-6 pt-6">
        <TabsList className="inline-flex h-auto items-center justify-start rounded-xl bg-muted/30 p-1 text-muted-foreground w-auto gap-1">
          {tabs.map((tab) => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id} 
              className="inline-flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm whitespace-nowrap hover:bg-muted/40"
            >
              <div className={`w-2 h-2 rounded-full transition-colors ${
                tab.completed 
                  ? 'bg-green-500 shadow-sm' 
                  : 'bg-muted-foreground/30'
              }`} />
              <span className="font-medium">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {/* Tab Content */}
      <div className="mt-0">
        <TabsContent value="validation" className="mt-0 border-0 p-0">
          <ValidationReportTab report={report} />
        </TabsContent>
        
        <TabsContent value="business-plan" className="mt-0 border-0 p-0">
          <ComingSoonTab 
            title="Business Plan Generation"
            description="Get a comprehensive AI-generated business plan based on your validated idea. This will include executive summary, market analysis, operations plan, and strategic roadmap to turn your concept into a thriving business."
            features={[
              "Executive Summary & Vision Statement",
              "Comprehensive Market Analysis & Strategy", 
              "Operations & Management Plan",
              "Financial Planning & Revenue Projections",
              "Risk Analysis & Mitigation Strategies"
            ]}
          />
        </TabsContent>
        
        <TabsContent value="marketing" className="mt-0 border-0 p-0">
          <ComingSoonTab 
            title="Marketing Analysis & Strategy"
            description="Discover your target audience and get personalized marketing recommendations to reach your ideal customers effectively. Build a data-driven marketing strategy that converts."
            features={[
              "Detailed Target Audience Profiling",
              "Comprehensive Competitor Marketing Analysis",
              "Multi-Channel Marketing Recommendations",
              "Content Strategy & Campaign Ideas",
              "Budget Optimization & Timeline Planning"
            ]}
          />
        </TabsContent>
        
        <TabsContent value="financial" className="mt-0 border-0 p-0">
          <ComingSoonTab 
            title="Financial Projections & Analysis"
            description="Get detailed financial forecasts and understand the investment requirements for your business idea. Make informed decisions with comprehensive financial modeling."
            features={[
              "5-Year Revenue & Growth Projections",
              "Detailed Cost Structure Analysis",
              "Break-even Analysis & Profitability Timeline",
              "Funding Requirements & Investment Strategy",
              "ROI Calculations & Financial Metrics"
            ]}
          />
        </TabsContent>
        
        <TabsContent value="action-items" className="mt-0 border-0 p-0">
          <ComingSoonTab 
            title="Actionable Next Steps"
            description="Get a prioritized roadmap of specific actions to take your validated idea from concept to launch. Transform insights into executable plans with clear milestones."
            features={[
              "Prioritized Task List with Dependencies",
              "Timeline & Milestone Planning",
              "Resource Requirements & Team Building",
              "Success Metrics & KPI Tracking",
              "Risk Checkpoints & Contingency Plans"
            ]}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default BusinessDashboardTabs;
