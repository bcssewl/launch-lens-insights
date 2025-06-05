
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Printer, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

import ResultsHeader from '@/components/results/ResultsHeader';
import OverviewTabContent from '@/components/results/OverviewTabContent';
import MarketAnalysisTabContent from '@/components/results/MarketAnalysisTabContent';
import CompetitionTabContent from '@/components/results/CompetitionTabContent';
import SWOTAnalysisTabContent from '@/components/results/SWOTAnalysisTabContent';
import DetailedScoresTabContent from '@/components/results/DetailedScoresTabContent';
import ActionItemsTabContent from '@/components/results/ActionItemsTabContent';
import FinancialAnalysisTabContent from '@/components/results/FinancialAnalysisTabContent';
import PrintView from '@/components/results/PrintView';

interface SharedReportData {
  id: string;
  validation_id: string;
  status: 'generating' | 'completed' | 'failed' | 'archived';
  overall_score?: number;
  recommendation?: string;
  completed_at?: string;
  created_at: string;
  report_data?: any;
  idea_name?: string;
  one_line_description?: string;
  access_level: 'view' | 'comment' | 'edit';
  expires_at?: string;
}

const SharedReportPage: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [report, setReport] = useState<SharedReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPrintView, setShowPrintView] = useState(false);

  useEffect(() => {
    if (!shareToken) {
      setError('No share token provided');
      setLoading(false);
      return;
    }

    const fetchSharedReport = async () => {
      try {
        setLoading(true);
        
        // Fetch the shared report using the share token
        const { data: shareData, error: shareError } = await supabase
          .from('report_shares')
          .select(`
            access_level,
            expires_at,
            report_id,
            validation_reports!inner(
              *,
              idea_validations!inner(
                id,
                idea_name,
                one_line_description
              )
            )
          `)
          .eq('share_token', shareToken)
          .single();

        if (shareError) {
          if (shareError.code === 'PGRST116') {
            setError('Share link not found or has expired');
          } else {
            setError(shareError.message);
          }
          return;
        }

        // Check if the share has expired
        if (shareData.expires_at && new Date(shareData.expires_at) < new Date()) {
          setError('This share link has expired');
          return;
        }

        // Transform the data
        const reportData = shareData.validation_reports;
        const transformedReport: SharedReportData = {
          ...reportData,
          status: reportData.status as 'generating' | 'completed' | 'failed' | 'archived',
          idea_name: reportData.idea_validations?.idea_name,
          one_line_description: reportData.idea_validations?.one_line_description,
          access_level: shareData.access_level,
          expires_at: shareData.expires_at,
        };

        setReport(transformedReport);
      } catch (err) {
        setError('Failed to fetch shared report');
        console.error('Error fetching shared report:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedReport();
  }, [shareToken]);

  const handleOpenPrintView = () => {
    setShowPrintView(true);
  };

  const handleClosePrintView = () => {
    setShowPrintView(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
        <div className="w-full max-w-7xl mx-auto px-6 py-8 space-y-6">
          <Skeleton className="h-32 w-full rounded-3xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-64 w-full rounded-3xl" />
            <Skeleton className="h-64 w-full rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
        <div className="w-full max-w-7xl mx-auto px-6 py-8">
          <Alert variant="destructive" className="rounded-2xl border-0 shadow-lg">
            <AlertDescription>
              {error || 'Report not found'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Get report data or use default structure
  const reportData = report.report_data || {};
  
  const ideaName = report.idea_name || 'Untitled Idea';
  const score = report.overall_score || 0;
  const recommendation = report.recommendation || 'Analysis in progress';
  const analysisDate = report.completed_at 
    ? format(new Date(report.completed_at), 'MMM d, yyyy')
    : format(new Date(report.created_at), 'MMM d, yyyy');

  const executiveSummary = reportData.executiveSummary || report.one_line_description || 'No summary available';
  const keyMetrics = reportData.keyMetrics || {
    marketSize: { value: 'N/A' },
    competitionLevel: { value: 'N/A' },
    problemClarity: { value: 'N/A' },
    revenuePotential: { value: 'N/A' }
  };

  const marketAnalysisData = reportData.marketAnalysis || {};
  const marketAnalysis = {
    tamSamSom: marketAnalysisData.tamSamSom || [],
    marketGrowth: marketAnalysisData.marketGrowth || [],
    customerSegments: marketAnalysisData.customerSegments || [],
    geographicOpportunity: marketAnalysisData.geographicOpportunity || []
  };

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

  // Show print view if requested
  if (showPrintView) {
    return (
      <PrintView
        ideaName={ideaName}
        score={score}
        recommendation={recommendation}
        analysisDate={analysisDate}
        executiveSummary={executiveSummary}
        keyMetrics={keyMetrics}
        marketAnalysis={marketAnalysis}
        competition={competition}
        financialAnalysis={financialAnalysis}
        swot={swot}
        detailedScores={detailedScores}
        actionItems={actionItems}
        onClose={handleClosePrintView}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <div className="w-full max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Shared Report Header */}
        <div className="w-full p-4 bg-card rounded-lg shadow space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ExternalLink className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Shared Report</span>
              {report.expires_at && (
                <span className="text-xs text-muted-foreground">
                  • Expires {format(new Date(report.expires_at), 'MMM d, yyyy')}
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              Access: {report.access_level}
            </div>
          </div>
        </div>

        <div data-results-header>
          <ResultsHeader 
            ideaName={ideaName}
            score={score}
            recommendationText={recommendation}
            analysisDate={analysisDate}
          />
        </div>

        <div className="apple-card border-0 shadow-lg">
          <Tabs defaultValue="overview" className="w-full">
            <div className="w-full overflow-x-auto mb-6 p-6 pb-0">
              <TabsList className="flex min-w-fit w-max bg-muted/30 rounded-2xl p-1">
                <TabsTrigger value="overview" className="flex-shrink-0 text-xs sm:text-sm px-3 py-2 rounded-xl whitespace-nowrap">Overview</TabsTrigger>
                <TabsTrigger value="market" className="flex-shrink-0 text-xs sm:text-sm px-3 py-2 rounded-xl whitespace-nowrap">Market</TabsTrigger>
                <TabsTrigger value="competition" className="flex-shrink-0 text-xs sm:text-sm px-3 py-2 rounded-xl whitespace-nowrap">Competition</TabsTrigger>
                <TabsTrigger value="financial" className="flex-shrink-0 text-xs sm:text-sm px-3 py-2 rounded-xl whitespace-nowrap">Financial</TabsTrigger>
                <TabsTrigger value="swot" className="flex-shrink-0 text-xs sm:text-sm px-3 py-2 rounded-xl whitespace-nowrap">SWOT</TabsTrigger>
                <TabsTrigger value="scores" className="flex-shrink-0 text-xs sm:text-sm px-3 py-2 rounded-xl whitespace-nowrap">Scores</TabsTrigger>
                <TabsTrigger value="actions" className="flex-shrink-0 text-xs sm:text-sm px-3 py-2 rounded-xl whitespace-nowrap">Actions</TabsTrigger>
              </TabsList>
            </div>
            
            <div className="w-full px-6 pb-6">
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
        </div>

        <div className="w-full border-t border-border/50 pt-8 mt-8">
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button variant="outline" size="sm" className="w-full sm:w-auto apple-button-outline" onClick={handleOpenPrintView}>
              <Printer className="mr-2 h-4 w-4" /> Print / Save as PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedReportPage;
