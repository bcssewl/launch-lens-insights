
export interface ReportData {
  ideaName: string;
  score: number;
  recommendation: string;
  analysisDate: string;
  executiveSummary: string;
  keyMetrics: any;
  marketAnalysis: {
    tamSamSom?: ChartData[];
    marketGrowth?: ChartData[];
    customerSegments?: ChartData[];
    geographicOpportunity?: ChartData[];
  };
  financialAnalysis: {
    startupCost?: number;
    monthlyBurn?: number;
    breakEvenMonth?: number;
    fundingNeeded?: number;
    startupCosts?: ChartData[];
    revenueProjections?: ChartData[];
    cac?: number;
    ltv?: number;
    grossMargin?: number;
    mrrGrowth?: number;
  };
  competition: {
    competitors?: Array<{
      name: string;
      funding: string;
      similarity: number;
    }>;
    competitiveAdvantages?: string[];
    marketSaturation?: string;
  };
  swot: {
    strengths?: string[];
    weaknesses?: string[];
    opportunities?: string[];
    threats?: string[];
  };
  riskAssessment?: {
    risks?: Array<{
      category: string;
      level: 'Low' | 'Medium' | 'High';
      description: string;
    }>;
  };
  implementation?: {
    timeline?: Array<{
      phase: string;
      timeline: string;
      tasks: string[];
    }>;
  };
  detailedScores: Array<{
    category: string;
    score: number;
  }>;
  actionItems: Array<{
    title: string;
    description: string;
    effort: string;
    impact: string;
    priority: 'High' | 'Medium' | 'Low';
  }>;
}

export interface ChartData {
  name: string;
  value: number;
  year?: string;
  growth?: number;
}

export interface ChartConfig {
  width?: number;
  height?: number;
  colors?: string[];
  padding?: number;
}
