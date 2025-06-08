
import { parseFinancialAnalysis } from '@/utils/financialDataParser';

export const transformReportDataForPrint = (report: any) => {
  const reportData = report.report_data || {};
  
  // Enhanced financial analysis handling
  let financialAnalysis = reportData.financial_analysis || reportData.financialAnalysis;
  
  // Try to parse the new comprehensive format
  const parsedFinancial = parseFinancialAnalysis(financialAnalysis);
  if (parsedFinancial) {
    financialAnalysis = parsedFinancial;
  }
  
  // Only transform existing data, don't add mock data
  return {
    executiveSummary: reportData.executive_summary || report.recommendation || report.one_line_description || '',
    keyMetrics: reportData.key_metrics || reportData.keyMetrics || {},
    marketAnalysis: reportData.market_analysis || reportData.marketAnalysis || {},
    competition: reportData.competition || {},
    financialAnalysis: financialAnalysis || {},
    swot: reportData.swot || {},
    detailedScores: reportData.detailed_scores || reportData.detailedScores || [],
    actionItems: reportData.action_items || reportData.actionItems || []
  };
};
