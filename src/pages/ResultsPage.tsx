
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
        <div className="min-h-screen page-background">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/50 to-background">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
          </div>
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-6 space-y-6">
            <div className="glassmorphism-card p-6">
              <Skeleton className="h-32 w-full bg-muted/20" />
            </div>
            <div className="glassmorphism-card p-6">
              <Skeleton className="h-12 w-full bg-muted/20" />
            </div>
            <div className="space-y-4">
              <div className="glassmorphism-card p-6">
                <Skeleton className="h-64 w-full bg-muted/20" />
              </div>
              <div className="glassmorphism-card p-6">
                <Skeleton className="h-64 w-full bg-muted/20" />
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !report) {
    return (
      <DashboardLayout>
        <div className="min-h-screen page-background">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/50 to-background"></div>
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-6">
            <div className="glassmorphism-card p-6">
              <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
                <AlertDescription>
                  {error || 'Report not found'}
                </AlertDescription>
              </Alert>
            </div>
          </div>
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
      <div className="min-h-screen page-background">
        {/* Glassmorphism Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/50 to-background">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-6 space-y-6">
          <ResultsHeader 
            ideaName={ideaName}
            score={score}
            recommendationText={recommendation}
            analysisDate={analysisDate}
          />

          <div className="glassmorphism-card p-6 hover-lift">
            <Tabs defaultValue="overview" className="w-full">
              <div className="w-full overflow-x-auto mb-4">
                <TabsList className="w-full grid grid-cols-6 min-w-fit bg-background/50 backdrop-blur-sm">
                  <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Overview</TabsTrigger>
                  <TabsTrigger value="market" className="text-xs sm:text-sm px-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Market</TabsTrigger>
                  <TabsTrigger value="competition" className="text-xs sm:text-sm px-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Competition</TabsTrigger>
                  <TabsTrigger value="swot" className="text-xs sm:text-sm px-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">SWOT</TabsTrigger>
                  <TabsTrigger value="scores" className="text-xs sm:text-sm px-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Scores</TabsTrigger>
                  <TabsTrigger value="actions" className="text-xs sm:text-sm px-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Actions</TabsTrigger>
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
          </div>

          <div className="glassmorphism-card p-6 hover-lift">
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button variant="outline" size="sm" className="w-full sm:w-auto bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80">
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </Button>
              <Button variant="outline" size="sm" className="w-full sm:w-auto bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80" onClick={handleAIFollowUp}>
                <MessageSquare className="mr-2 h-4 w-4" /> Ask AI Follow-up
              </Button>
              <Button size="sm" className="w-full sm:w-auto gradient-button shadow-soft">
                <Save className="mr-2 h-4 w-4" /> Save to My Reports
              </Button>
              <Button variant="secondary" size="sm" className="w-full sm:w-auto bg-secondary/80 backdrop-blur-sm">
                <PlusCircle className="mr-2 h-4 w-4" /> Start New Analysis
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResultsPage;
