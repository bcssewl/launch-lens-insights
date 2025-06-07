import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, Share, Eye, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import ShareReportDialog from '@/components/results/ShareReportDialog';
import ManageSharesDialog from '@/components/results/ManageSharesDialog';
import PrintView from '@/components/results/PrintView';

interface ValidationReportTabProps {
  report: any;
}

const ValidationReportTab: React.FC<ValidationReportTabProps> = ({ report }) => {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [manageSharesOpen, setManageSharesOpen] = useState(false);
  const [showPrintView, setShowPrintView] = useState(false);
  
  const score = report.overall_score || 0;
  const recommendation = report.recommendation || 'No recommendation available';
  const ideaName = report.idea_name || 'Untitled Idea';
  const description = report.one_line_description || 'No description available';

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600';
    if (score >= 5) return 'text-blue-600';
    if (score >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (score: number) => {
    if (score >= 7) return { text: 'Validated', class: 'bg-green-100 text-green-800 border-green-200' };
    if (score >= 5) return { text: 'Promising', class: 'bg-blue-100 text-blue-800 border-blue-200' };
    if (score >= 3) return { text: 'Caution', class: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    return { text: 'High Risk', class: 'bg-red-100 text-red-800 border-red-200' };
  };

  const handleDownloadPDF = () => {
    setShowPrintView(true);
  };

  // Transform report data for PrintView component with proper structure
  const transformReportDataForPrint = () => {
    const reportData = report.report_data || {};
    
    return {
      executiveSummary: reportData.executive_summary || recommendation,
      keyMetrics: {
        marketSize: { 
          value: reportData.key_metrics?.market_size || '$1B+',
          label: 'Total addressable market'
        },
        competitionLevel: { 
          value: reportData.key_metrics?.competition_level || 'Moderate',
          subValue: 'Competitive intensity'
        },
        problemClarity: { 
          value: reportData.key_metrics?.problem_clarity || 'High'
        },
        revenuePotential: { 
          value: reportData.key_metrics?.revenue_potential || 'Strong'
        }
      },
      marketAnalysis: reportData.market_analysis || {
        tamSamSom: [
          { name: 'TAM', value: 1000 },
          { name: 'SAM', value: 100 },
          { name: 'SOM', value: 10 }
        ],
        marketGrowth: [
          { year: '2024', growth: 15 },
          { year: '2025', growth: 18 },
          { year: '2026', growth: 22 }
        ],
        customerSegments: [
          { name: 'Primary Target', value: 45 },
          { name: 'Secondary Target', value: 35 },
          { name: 'Tertiary Target', value: 20 }
        ],
        geographicOpportunity: [
          { name: 'North America', value: 40 },
          { name: 'Europe', value: 35 },
          { name: 'Asia Pacific', value: 25 }
        ]
      },
      competition: reportData.competition || {
        competitors: [],
        competitiveAdvantages: [],
        marketSaturation: 'Moderate'
      },
      financialAnalysis: {
        keyMetrics: {
          totalStartupCost: reportData.financial_analysis?.totalStartupCost || 50000,
          monthlyBurnRate: reportData.financial_analysis?.monthlyOperatingCost || 5000,
          breakEvenMonth: reportData.financial_analysis?.breakEvenPoint ? 
            parseInt(reportData.financial_analysis.breakEvenPoint.replace(/\D/g, '')) || 12 : 12,
          fundingNeeded: reportData.financial_analysis?.investmentRequired || 75000
        },
        startupCosts: reportData.financial_analysis?.startupCosts || [],
        revenueProjections: reportData.financial_analysis?.revenueProjections || [],
        investmentRequired: reportData.financial_analysis?.investmentRequired || 0,
        breakEvenPoint: reportData.financial_analysis?.breakEvenPoint || '12 months',
        roi: reportData.financial_analysis?.roi || '25%',
        totalStartupCost: reportData.financial_analysis?.totalStartupCost || 50000,
        monthlyOperatingCost: reportData.financial_analysis?.monthlyOperatingCost || 5000,
        projectedRevenueYear1: reportData.financial_analysis?.projectedRevenueYear1 || 100000,
        projectedRevenueYear2: reportData.financial_analysis?.projectedRevenueYear2 || 250000,
        projectedRevenueYear3: reportData.financial_analysis?.projectedRevenueYear3 || 500000
      },
      swot: reportData.swot || {
        strengths: ['Unique value proposition', 'Strong market timing'],
        weaknesses: ['Limited resources', 'New to market'],
        opportunities: ['Growing market demand', 'Technology trends'],
        threats: ['Competitive pressure', 'Market saturation']
      },
      detailedScores: reportData.detailed_scores || [
        { category: 'Market Opportunity', score: score },
        { category: 'Competition Level', score: score },
        { category: 'Implementation Feasibility', score: score },
        { category: 'Financial Viability', score: score }
      ],
      actionItems: reportData.action_items || [
        { title: 'Conduct market research', priority: 'High', timeline: '2 weeks' },
        { title: 'Develop MVP', priority: 'High', timeline: '3 months' },
        { title: 'Secure funding', priority: 'Medium', timeline: '6 months' }
      ]
    };
  };

  const statusBadge = getStatusBadge(score);

  // If showing print view, render it
  if (showPrintView) {
    const printData = transformReportDataForPrint();
    
    return (
      <PrintView
        ideaName={ideaName}
        score={score}
        recommendation={recommendation}
        analysisDate={report.completed_at || report.created_at}
        executiveSummary={printData.executiveSummary}
        keyMetrics={printData.keyMetrics}
        marketAnalysis={printData.marketAnalysis}
        competition={printData.competition}
        financialAnalysis={printData.financialAnalysis}
        swot={printData.swot}
        detailedScores={printData.detailedScores}
        actionItems={printData.actionItems}
        onClose={() => setShowPrintView(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <Card className="enhanced-card border-l-4 border-l-green-500">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <CardTitle className="text-lg">Validation Complete</CardTitle>
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              Completed
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your idea validation analysis has been completed. View the full detailed report or share it with others.
          </p>
        </CardContent>
      </Card>

      {/* Quick Summary */}
      <Card className="enhanced-card">
        <CardHeader>
          <CardTitle>Validation Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Business Idea</h4>
              <h3 className="text-xl font-bold text-primary mb-2">{ideaName}</h3>
              <p className="text-muted-foreground text-sm">{description}</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Validation Score</h4>
              <div className="flex items-center gap-3">
                <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
                  {score}/10
                </span>
                <Badge variant="outline" className={statusBadge.class}>
                  {statusBadge.text}
                </Badge>
              </div>
            </div>
          </div>
          
          {recommendation && (
            <div className="pt-4 border-t">
              <h4 className="font-semibold text-foreground mb-2">Recommendation</h4>
              <p className="text-muted-foreground leading-relaxed">{recommendation}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="enhanced-card">
        <CardHeader>
          <CardTitle>Report Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to={`/results/${report.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Full Report
              </Link>
            </Button>
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              Print / Save as PDF
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShareDialogOpen(true)}
            >
              <Share className="mr-2 h-4 w-4" />
              Share Report
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setManageSharesOpen(true)}
            >
              <Settings className="mr-2 h-4 w-4" />
              Manage Shares
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps Teaser */}
      <Card className="enhanced-card border-dashed border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Ready for Next Steps?</span>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              Coming Soon
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Based on your validation results, we'll help you create a comprehensive business plan, 
            marketing strategy, and financial projections.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="p-3 bg-muted/50 rounded-lg text-center">
              <h5 className="font-semibold mb-1">Business Plan</h5>
              <p className="text-muted-foreground">Complete business strategy</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg text-center">
              <h5 className="font-semibold mb-1">Marketing Strategy</h5>
              <p className="text-muted-foreground">Targeted campaigns</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg text-center">
              <h5 className="font-semibold mb-1">Financial Model</h5>
              <p className="text-muted-foreground">Revenue projections</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Share Dialogs */}
      <ShareReportDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        reportId={report.id}
        reportTitle={ideaName}
      />

      <ManageSharesDialog
        open={manageSharesOpen}
        onOpenChange={setManageSharesOpen}
        reportId={report.id}
      />
    </div>
  );
};

export default ValidationReportTab;
