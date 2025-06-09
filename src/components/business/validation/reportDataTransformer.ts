
import { parseFinancialData } from '@/utils/financialDataParser';

export const transformReportDataForPrint = (report: any) => {
  const reportData = report.report_data || {};
  
  // Parse financial data using the new parser
  const rawFinancialData = reportData.financial_analysis || reportData.financialAnalysis || {};
  const parsedFinancialData = parseFinancialData(rawFinancialData);
  
  return {
    executiveSummary: reportData.executive_summary || report.recommendation || report.one_line_description || '',
    keyMetrics: reportData.key_metrics || reportData.keyMetrics || {},
    marketAnalysis: reportData.market_analysis || reportData.marketAnalysis || {},
    competition: reportData.competition || {},
    financialAnalysis: parsedFinancialData,
    swot: reportData.swot || {},
    detailedScores: reportData.detailed_scores || reportData.detailedScores || [],
    actionItems: reportData.action_items || reportData.actionItems || []
  };
};
