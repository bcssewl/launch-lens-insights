
export const transformReportDataForPrint = (report: any) => {
  const reportData = report.report_data || {};
  
  return {
    executiveSummary: reportData.executive_summary || report.recommendation || 'No executive summary available',
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
      { category: 'Market Opportunity', score: report.overall_score || 0 },
      { category: 'Competition Level', score: report.overall_score || 0 },
      { category: 'Implementation Feasibility', score: report.overall_score || 0 },
      { category: 'Financial Viability', score: report.overall_score || 0 }
    ],
    actionItems: reportData.action_items || [
      { title: 'Conduct market research', priority: 'High', timeline: '2 weeks' },
      { title: 'Develop MVP', priority: 'High', timeline: '3 months' },
      { title: 'Secure funding', priority: 'Medium', timeline: '6 months' }
    ]
  };
};
