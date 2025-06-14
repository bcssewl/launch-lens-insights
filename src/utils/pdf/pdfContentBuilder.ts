
import { ReportData } from './types';
import {
  createCoverPage,
  createTableOfContents,
  createExecutiveSummary,
  createKeyMetricsPage,
  createMarketAnalysisPages,
  createFinancialAnalysisPages,
  createCompetitiveAnalysisPages,
  createSWOTAnalysisPage,
  createDetailedScoresPage,
  createRiskAssessmentPage,
  createActionItemsPage,
  createImplementationTimelinePage,
  createFinalRecommendationsPage
} from './contentGenerators';

export const createComprehensivePDFContent = (data: ReportData): HTMLElement => {
  const container = document.createElement('div');
  
  // Use pixel-based styling for better html2canvas compatibility
  container.style.cssText = `
    width: 794px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #ffffff;
    color: #1a1a1a;
    line-height: 1.6;
    padding: 0;
    margin: 0;
    box-sizing: border-box;
  `;

  console.log('PDF Content: Building comprehensive report');

  // Create all sections
  const sections = [
    createCoverPage(data),
    createTableOfContents(),
    createExecutiveSummary(data),
    createKeyMetricsPage(data),
    ...createMarketAnalysisPages(data),
    ...createFinancialAnalysisPages(data),
    ...createCompetitiveAnalysisPages(data),
    createSWOTAnalysisPage(data),
    createRiskAssessmentPage(data),
    createDetailedScoresPage(data),
    createActionItemsPage(data),
    createImplementationTimelinePage(data),
    createFinalRecommendationsPage(data)
  ];
  
  sections.forEach((section, index) => {
    console.log(`PDF Content: Adding section ${index + 1}/${sections.length}`);
    container.appendChild(section);
  });

  console.log('PDF Content: Comprehensive report built successfully');
  return container;
};
