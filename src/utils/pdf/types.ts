
export interface ReportData {
  ideaName: string;
  score: number;
  recommendation: string;
  analysisDate: string;
  executiveSummary: string;
  keyMetrics?: {
    marketSize: { value: string; label?: string };
    competitionLevel: { value: string; subValue?: string };
    problemClarity: { value: string };
    revenuePotential: { value: string };
  };
  marketAnalysis?: any;
  competition?: any;
  financialAnalysis?: any;
  swot?: any;
  detailedScores?: any[];
  actionItems?: any[];
}
