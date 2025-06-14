
export interface ReportData {
  ideaName: string;
  score: number;
  recommendation: string;
  analysisDate: string;
  executiveSummary: string;
  keyMetrics: any;
  marketAnalysis: any;
  competition: any;
  financialAnalysis: any;
  swot: any;
  detailedScores: any[];
  actionItems: any[];
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
