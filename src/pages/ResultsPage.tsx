
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
        <div className="p-4 md:p-6 space-y-6">
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
        <div className="p-4 md:p-6">
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
      <div className="p-4 md:p-6 space-y-6">
        <ResultsHeader 
          ideaName={ideaName}
          score={score}
          recommendationText={recommendation}
          analysisDate={analysisDate}
        />

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="competition">Competition</TabsTrigger>
            <TabsTrigger value="swot">SWOT</TabsTrigger>
            <TabsTrigger value="scores">Scores</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-4">
            <OverviewTabContent 
              summary={executiveSummary}
              metrics={keyMetrics}
            />
          </TabsContent>
          <TabsContent value="market" className="mt-4">
            <MarketAnalysisTabContent data={marketAnalysis} />
          </TabsContent>
          <TabsContent value="competition" className="mt-4">
            <CompetitionTabContent data={competition} />
          </TabsContent>
          <TabsContent value="swot" className="mt-4">
            <SWOTAnalysisTabContent data={swot} />
          </TabsContent>
          <TabsContent value="scores" className="mt-4">
            <DetailedScoresTabContent scores={detailedScores} />
          </TabsContent>
          <TabsContent value="actions" className="mt-4">
            <ActionItemsTabContent items={actionItems} />
          </TabsContent>
        </Tabs>

        <div className="flex flex-col sm:flex-row gap-2 justify-end pt-6 border-t mt-6">
          <Button variant="outline"><Download className="mr-2" /> Download PDF</Button>
          <Button variant="outline"><MessageSquare className="mr-2" /> Ask AI Follow-up</Button>
          <Button><Save className="mr-2" /> Save to My Reports</Button>
          <Button variant="secondary"><PlusCircle className="mr-2" /> Start New Analysis</Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResultsPage;
