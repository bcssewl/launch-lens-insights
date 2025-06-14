
import { ReportData } from './types';
import {
  createCoverPage,
  createTableOfContents,
  createExecutiveSummary,
  createKeyMetricsPage,
  createMarketAnalysisPages,
  createSWOTAnalysisPage,
  createDetailedScoresPage,
  createActionItemsPage,
  createFinalRecommendationsPage
} from './contentGenerators';

export const createComprehensivePDFContent = (data: ReportData): HTMLElement => {
  const container = document.createElement('div');
  container.style.cssText = `
    width: 210mm;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: white;
    color: #1a1a1a;
    line-height: 1.6;
    position: absolute;
    left: -9999px;
    top: 0;
    padding: 0;
    margin: 0;
  `;

  // Create all sections
  const sections = [
    createCoverPage(data),
    createTableOfContents(),
    createExecutiveSummary(data),
    createKeyMetricsPage(data),
    ...createMarketAnalysisPages(data),
    createSWOTAnalysisPage(data),
    createDetailedScoresPage(data),
    createActionItemsPage(data),
    createFinalRecommendationsPage(data)
  ];
  
  sections.forEach(section => container.appendChild(section));

  return container;
};
