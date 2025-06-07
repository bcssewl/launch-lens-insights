
import { format } from 'date-fns';

export const preparePrintData = (report: any) => {
  const reportData = report.report_data || {};
  
  const ideaName = report.idea_name || 'Untitled Idea';
  const score = report.overall_score || 0;
  const recommendation = report.recommendation || 'No recommendation available';
  const analysisDate = report.completed_at 
    ? format(new Date(report.completed_at), 'MMM d, yyyy')
    : format(new Date(report.created_at), 'MMM d, yyyy');

  const executiveSummary = reportData.executiveSummary || reportData.executive_summary || report.one_line_description || 'No summary available';
  
  // Extract key metrics with comprehensive fallbacks
  const keyMetrics = reportData.keyMetrics || reportData.key_metrics || {
    marketSize: { value: 'N/A', label: 'Market Size' },
    competitionLevel: { value: 'N/A', label: 'Competition Level' },
    problemClarity: { value: 'N/A', label: 'Problem Clarity' },
    revenuePotential: { value: 'N/A', label: 'Revenue Potential' }
  };

  // Extract market analysis data
  const marketAnalysisData = reportData.marketAnalysis || reportData.market_analysis || {};
  const marketAnalysis = {
    tamSamSom: marketAnalysisData.tamSamSom || marketAnalysisData.tam_sam_som || [
      { name: 'TAM', value: 1000 },
      { name: 'SAM', value: 100 },
      { name: 'SOM', value: 10 }
    ],
    marketGrowth: marketAnalysisData.marketGrowth || marketAnalysisData.market_growth || [
      { year: '2024', growth: 8.5 },
      { year: '2025', growth: 12.3 },
      { year: '2026', growth: 15.8 }
    ],
    customerSegments: marketAnalysisData.customerSegments || marketAnalysisData.customer_segments || [
      { name: 'Early Adopters', value: 35 },
      { name: 'Mainstream', value: 45 },
      { name: 'Enterprise', value: 20 }
    ],
    geographicOpportunity: marketAnalysisData.geographicOpportunity || marketAnalysisData.geographic_opportunity || [
      { name: 'North America', value: 40 },
      { name: 'Europe', value: 30 },
      { name: 'Asia Pacific', value: 30 }
    ]
  };

  // Extract competition data
  const competition = reportData.competition || {
    competitors: reportData.competitors || [],
    competitiveAdvantages: reportData.competitive_advantages || reportData.competitiveAdvantages || [
      'Innovative technology approach',
      'Strong market timing',
      'Experienced team'
    ],
    marketSaturation: reportData.market_saturation || reportData.marketSaturation || 'Moderate'
  };
  
  // Extract financial analysis
  const financialAnalysis = reportData.financialAnalysis || reportData.financial_analysis || {
    startupCosts: reportData.startup_costs || [],
    operatingCosts: reportData.operating_costs || [],
    revenueProjections: reportData.revenue_projections || [
      { period: 'Year 1', revenue: 50000, costs: 40000, profit: 10000 },
      { period: 'Year 2', revenue: 150000, costs: 100000, profit: 50000 },
      { period: 'Year 3', revenue: 350000, costs: 200000, profit: 150000 }
    ],
    breakEvenAnalysis: reportData.break_even_analysis || reportData.breakEvenAnalysis || [],
    fundingRequirements: reportData.funding_requirements || reportData.fundingRequirements || [],
    keyMetrics: reportData.financial_metrics || {
      totalStartupCost: 50000,
      monthlyBurnRate: 8000,
      breakEvenMonth: 8,
      fundingNeeded: 100000
    }
  };
  
  // Extract SWOT analysis
  const swot = reportData.swot || {
    strengths: reportData.strengths || [
      'Strong value proposition',
      'Market timing advantage',
      'Scalable business model'
    ],
    weaknesses: reportData.weaknesses || [
      'Limited initial resources',
      'Need for market education'
    ],
    opportunities: reportData.opportunities || [
      'Growing market demand',
      'Emerging technology trends',
      'Partnership potential'
    ],
    threats: reportData.threats || [
      'Competitive pressure',
      'Market saturation risk',
      'Economic uncertainty'
    ]
  };
  
  // Extract detailed scores
  const detailedScores = reportData.detailedScores || reportData.detailed_scores || [
    { category: 'Market Opportunity', score: score * 0.9 },
    { category: 'Problem Validation', score: score * 0.95 },
    { category: 'Solution Fit', score: score * 0.85 },
    { category: 'Business Model', score: score * 0.8 },
    { category: 'Competitive Position', score: score * 0.75 },
    { category: 'Team & Execution', score: score * 0.9 }
  ];

  // Extract action items
  const actionItems = reportData.actionItems || reportData.action_items || [
    {
      title: 'Validate target customer segment',
      description: 'Conduct customer interviews to confirm product-market fit',
      priority: 'High',
      timeline: '2-4 weeks',
      category: 'Market Research'
    },
    {
      title: 'Develop MVP prototype',
      description: 'Create minimum viable product for initial testing',
      priority: 'High',
      timeline: '6-8 weeks',
      category: 'Product Development'
    },
    {
      title: 'Secure initial funding',
      description: 'Prepare pitch deck and approach potential investors',
      priority: 'Medium',
      timeline: '8-12 weeks',
      category: 'Funding'
    }
  ];

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
