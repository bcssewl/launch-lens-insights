
import { format } from 'date-fns';

export const preparePrintData = (report: any) => {
  const reportData = report.report_data || {};
  
  const ideaName = report.idea_name || 'Untitled Idea';
  const score = report.overall_score || 0;
  const recommendation = report.recommendation || 'No recommendation available';
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

  return {
    ideaName,
    score,
    recommendation,
    analysisDate,
    executiveSummary,
    keyMetrics,
    marketAnalysis,
    competition,
    financialAnalysis,
    swot,
    detailedScores,
    actionItems
  };
};
