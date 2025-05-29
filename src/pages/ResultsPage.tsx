
import React from 'react';
import { useParams } from 'react-router-dom';
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
import { useValidationReport } from '@/hooks/useValidationReport';
import { format } from 'date-fns';

const ResultsPage: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const { report, loading, error } = useValidationReport(reportId || '');

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-6 space-y-6 max-w-full overflow-hidden">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-12 w-full" />
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !report) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-6 max-w-full overflow-hidden">
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

  // Extract detailed data with fallbacks
  const executiveSummary = reportData.executiveSummary || report.one_line_description || 'No summary available';
  const keyMetrics = reportData.keyMetrics || {
    marketSize: { value: 'N/A' },
    competitionLevel: { value: 'N/A' },
    problemClarity: { value: 'N/A' },
    revenuePotential: { value: 'N/A' }
  };
  const marketAnalysis = reportData.marketAnalysis || {
    tamSamSom: [],
    marketGrowth: [],
    customerSegments: [],
    geographicOpportunity: []
  };
  const competition = reportData.competition || {
    competitors: [],
    competitiveAdvantages: [],
    marketSaturation: 'Unknown'
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
      <div className="w-full max-w-full overflow-hidden">
        <div className="p-4 md:p-6 space-y-6 max-w-full">
          <div className="w-full max-w-full overflow-hidden">
            <ResultsHeader 
              ideaName={ideaName}
              score={score}
              recommendationText={recommendation}
              analysisDate={analysisDate}
            />
          </div>

          <div className="w-full max-w-full overflow-hidden">
            <Tabs defaultValue="overview" className="w-full max-w-full">
              <div className="w-full overflow-x-auto">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 min-w-fit">
                  <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
                  <TabsTrigger value="market" className="text-xs sm:text-sm">Market</TabsTrigger>
                  <TabsTrigger value="competition" className="text-xs sm:text-sm">Competition</TabsTrigger>
                  <TabsTrigger value="swot" className="text-xs sm:text-sm">SWOT</TabsTrigger>
                  <TabsTrigger value="scores" className="text-xs sm:text-sm">Scores</TabsTrigger>
                  <TabsTrigger value="actions" className="text-xs sm:text-sm">Actions</TabsTrigger>
                </TabsList>
              </div>
              <div className="w-full max-w-full overflow-hidden">
                <TabsContent value="overview" className="mt-4 w-full max-w-full overflow-hidden">
                  <OverviewTabContent 
                    summary={executiveSummary}
                    metrics={keyMetrics}
                  />
                </TabsContent>
                <TabsContent value="market" className="mt-4 w-full max-w-full overflow-hidden">
                  <MarketAnalysisTabContent data={marketAnalysis} />
                </TabsContent>
                <TabsContent value="competition" className="mt-4 w-full max-w-full overflow-hidden">
                  <CompetitionTabContent data={competition} />
                </TabsContent>
                <TabsContent value="swot" className="mt-4 w-full max-w-full overflow-hidden">
                  <SWOTAnalysisTabContent data={swot} />
                </TabsContent>
                <TabsContent value="scores" className="mt-4 w-full max-w-full overflow-hidden">
                  <DetailedScoresTabContent scores={detailedScores} />
                </TabsContent>
                <TabsContent value="actions" className="mt-4 w-full max-w-full overflow-hidden">
                  <ActionItemsTabContent items={actionItems} />
                </TabsContent>
              </div>
            </Tabs>
          </div>

          <div className="w-full max-w-full overflow-hidden">
            <div className="flex flex-col sm:flex-row gap-2 justify-end pt-6 border-t mt-6">
              <div className="flex flex-wrap gap-2 justify-end">
                <Button variant="outline" className="text-xs sm:text-sm whitespace-nowrap">
                  <Download className="mr-2 h-4 w-4" /> Download PDF
                </Button>
                <Button variant="outline" className="text-xs sm:text-sm whitespace-nowrap">
                  <MessageSquare className="mr-2 h-4 w-4" /> Ask AI Follow-up
                </Button>
                <Button className="text-xs sm:text-sm whitespace-nowrap">
                  <Save className="mr-2 h-4 w-4" /> Save to My Reports
                </Button>
                <Button variant="secondary" className="text-xs sm:text-sm whitespace-nowrap">
                  <PlusCircle className="mr-2 h-4 w-4" /> Start New Analysis
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResultsPage;
