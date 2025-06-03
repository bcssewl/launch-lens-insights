
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Download, MessageSquare, PlusCircle, Save } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

import ResultsHeader from '@/components/results/ResultsHeader';
import OverviewTabContent from '@/components/results/OverviewTabContent';
import MarketAnalysisTabContent from '@/components/results/MarketAnalysisTabContent';
import CompetitionTabContent from '@/components/results/CompetitionTabContent';
import SWOTAnalysisTabContent from '@/components/results/SWOTAnalysisTabContent';
import DetailedScoresTabContent from '@/components/results/DetailedScoresTabContent';
import ActionItemsTabContent from '@/components/results/ActionItemsTabContent';
import FinancialAnalysisTabContent from '@/components/results/FinancialAnalysisTabContent';
import { useValidationReport } from '@/hooks/useValidationReport';
import { format } from 'date-fns';

const ResultsPage: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const { report, loading, error } = useValidationReport(reportId || '');

  const handleAIFollowUp = () => {
    navigate('/dashboard/assistant');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-12 w-full" />
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  };

  if (error || !report) {
    return (
      <DashboardLayout>
        <div className="w-full max-w-7xl mx-auto px-4 py-6">
          <Alert variant="destructive">
            <AlertDescription>
              {error || 'Report not found'}
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  // Get report data or use default structure
  const reportData = report.report_data || {};
  
  // Extract basic info
  const ideaName = report.idea_name || 'Untitled Idea';
  const score = report.overall_score || 0;
  const recommendation = report.recommendation || 'Analysis in progress';
  const analysisDate = report.completed_at 
    ? format(new Date(report.completed_at), 'MMM d, yyyy')
    : format(new Date(report.created_at), 'MMM d, yyyy');

  // Extract detailed data with proper fallbacks
  const executiveSummary = reportData.executiveSummary || report.one_line_description || 'No summary available';
  const keyMetrics = reportData.keyMetrics || {
    marketSize: { value: 'N/A' },
    competitionLevel: { value: 'N/A' },
    problemClarity: { value: 'N/A' },
    revenuePotential: { value: 'N/A' }
  };

  // Extract market analysis data with proper structure
  const marketAnalysisData = reportData.marketAnalysis || {};
  const marketAnalysis = {
    tamSamSom: marketAnalysisData.tamSamSom || [],
    marketGrowth: marketAnalysisData.marketGrowth || [],
    customerSegments: marketAnalysisData.customerSegments || [],
    geographicOpportunity: marketAnalysisData.geographicOpportunity || []
  };

  // Extract other data sections
  const competition = reportData.competition || {
    competitors: [],
    competitiveAdvantages: [],
    marketSaturation: 'Unknown'
  };
  const financialAnalysis = reportData.financialAnalysis || {
    startupCosts: [],
    operatingCosts: [],
    revenueProjections: [],
    breakEvenAnalysis: [],
    fundingRequirements: [],
    keyMetrics: {
      totalStartupCost: 0,
      monthlyBurnRate: 0,
      breakEvenMonth: 0,
      fundingNeeded: 0
    }
  };
  const swot = reportData.swot || {
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: []
  };
  const detailedScores = reportData.detailedScores || [];
  const actionItems = reportData.actionItems || [];

  return (
    <DashboardLayout>
      <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6">
        <ResultsHeader 
          ideaName={ideaName}
          score={score}
          recommendationText={recommendation}
          analysisDate={analysisDate}
        />

        <Tabs defaultValue="overview" className="w-full">
          <div className="w-full overflow-x-auto mb-4">
            <TabsList className="w-full grid grid-cols-7 min-w-fit">
              <TabsTrigger value="overview" className="text-xs sm:text-sm px-2">Overview</TabsTrigger>
              <TabsTrigger value="market" className="text-xs sm:text-sm px-2">Market</TabsTrigger>
              <TabsTrigger value="competition" className="text-xs sm:text-sm px-2">Competition</TabsTrigger>
              <TabsTrigger value="financial" className="text-xs sm:text-sm px-2">Financial</TabsTrigger>
              <TabsTrigger value="swot" className="text-xs sm:text-sm px-2">SWOT</TabsTrigger>
              <TabsTrigger value="scores" className="text-xs sm:text-sm px-2">Scores</TabsTrigger>
              <TabsTrigger value="actions" className="text-xs sm:text-sm px-2">Actions</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="w-full">
            <TabsContent value="overview" className="mt-4 w-full">
              <OverviewTabContent 
                summary={executiveSummary}
                metrics={keyMetrics}
              />
            </TabsContent>
            <TabsContent value="market" className="mt-4 w-full">
              <MarketAnalysisTabContent data={marketAnalysis} />
            </TabsContent>
            <TabsContent value="competition" className="mt-4 w-full">
              <CompetitionTabContent data={competition} />
            </TabsContent>
            <TabsContent value="financial" className="mt-4 w-full">
              <FinancialAnalysisTabContent data={financialAnalysis} />
            </TabsContent>
            <TabsContent value="swot" className="mt-4 w-full">
              <SWOTAnalysisTabContent data={swot} />
            </TabsContent>
            <TabsContent value="scores" className="mt-4 w-full">
              <DetailedScoresTabContent scores={detailedScores} />
            </TabsContent>
            <TabsContent value="actions" className="mt-4 w-full">
              <ActionItemsTabContent items={actionItems} />
            </TabsContent>
          </div>
        </Tabs>

        <div className="w-full border-t pt-6 mt-6">
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
            <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={handleAIFollowUp}>
              <MessageSquare className="mr-2 h-4 w-4" /> Ask AI Follow-up
            </Button>
            <Button size="sm" className="w-full sm:w-auto">
              <Save className="mr-2 h-4 w-4" /> Save to My Reports
            </Button>
            <Button variant="secondary" size="sm" className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Start New Analysis
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResultsPage;
