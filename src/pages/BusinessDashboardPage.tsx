
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Calendar, BarChart } from 'lucide-react';
import { useValidationReport } from '@/hooks/useValidationReport';
import { Skeleton } from '@/components/ui/skeleton';
import ComingSoonTab from '@/components/business/ComingSoonTab';
import ValidationReportTab from '@/components/business/ValidationReportTab';

const BusinessDashboardPage: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const { report, loading, error } = useValidationReport(reportId || '');

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-6 space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !report) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-6">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-4">Business Idea Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The business idea you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/dashboard/ideas">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to My Ideas
              </Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusColor = (score: number) => {
    if (score >= 7) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 5) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (score >= 3) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getStatusText = (score: number) => {
    if (score >= 7) return 'Validated';
    if (score >= 5) return 'Promising';
    if (score >= 3) return 'Caution';
    return 'High Risk';
  };

  const ideaName = report.idea_validations?.idea_name || 'Untitled Business Idea';
  const score = report.overall_score || 0;
  const lastUpdated = report.completed_at || report.created_at;

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/dashboard" className="hover:text-foreground">Dashboard</Link>
          <span>→</span>
          <Link to="/dashboard/ideas" className="hover:text-foreground">My Ideas</Link>
          <span>→</span>
          <span className="text-foreground">{ideaName}</span>
        </div>

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard/ideas">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to Ideas
                </Link>
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-foreground">{ideaName}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <BarChart className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold text-primary">{score}/10</span>
                <Badge variant="outline" className={getStatusColor(score)}>
                  {getStatusText(score)}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Updated {new Date(lastUpdated).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Overview Card */}
        <Card className="enhanced-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Project Progress</span>
              <span className="text-sm font-normal text-muted-foreground">1 of 5 sections complete</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={20} className="h-2" />
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                <div className="flex items-center gap-1 text-green-600">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Validation Report</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-muted"></div>
                  <span>Business Plan</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-muted"></div>
                  <span>Marketing Analysis</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-muted"></div>
                  <span>Financial Projections</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-muted"></div>
                  <span>Action Items</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Dashboard Content */}
        <Tabs defaultValue="validation" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="validation" className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              Validation Report
            </TabsTrigger>
            <TabsTrigger value="business-plan" className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-muted"></div>
              Business Plan
            </TabsTrigger>
            <TabsTrigger value="marketing" className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-muted"></div>
              Marketing
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-muted"></div>
              Financial
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-muted"></div>
              Action Items
            </TabsTrigger>
          </TabsList>

          <TabsContent value="validation" className="mt-6">
            <ValidationReportTab report={report} />
          </TabsContent>

          <TabsContent value="business-plan" className="mt-6">
            <ComingSoonTab 
              title="Business Plan Generator"
              description="Generate a comprehensive business plan based on your validation results, including market analysis, competitive positioning, and strategic roadmap."
              features={[
                "Executive Summary",
                "Market Analysis & Strategy",
                "Competitive Landscape",
                "Financial Projections",
                "Implementation Timeline"
              ]}
            />
          </TabsContent>

          <TabsContent value="marketing" className="mt-6">
            <ComingSoonTab 
              title="Marketing Analysis & Strategy"
              description="Develop targeted marketing strategies and campaigns based on your validated market insights and customer segments."
              features={[
                "Target Audience Profiles",
                "Marketing Channel Analysis",
                "Campaign Recommendations",
                "Content Strategy",
                "Budget Allocation"
              ]}
            />
          </TabsContent>

          <TabsContent value="financial" className="mt-6">
            <ComingSoonTab 
              title="Financial Projections & Modeling"
              description="Create detailed financial forecasts, funding requirements, and revenue projections for your business idea."
              features={[
                "Revenue Forecasting",
                "Cost Structure Analysis",
                "Funding Requirements",
                "Break-even Analysis",
                "ROI Projections"
              ]}
            />
          </TabsContent>

          <TabsContent value="actions" className="mt-6">
            <ComingSoonTab 
              title="Action Items & Roadmap"
              description="Get a personalized action plan with specific next steps, milestones, and resources to move your idea forward."
              features={[
                "Prioritized Action Items",
                "Implementation Timeline",
                "Resource Requirements",
                "Risk Mitigation",
                "Success Metrics"
              ]}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default BusinessDashboardPage;
