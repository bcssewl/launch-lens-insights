
import { ReportData } from './types';
import { format } from 'date-fns';

export const createProfessionalCoverPage = (data: ReportData): HTMLElement => {
  const page = document.createElement('div');
  page.className = 'professional-cover-page';
  page.innerHTML = `
    <div class="cover-header">
      <div class="brand-logo">
        <div class="logo-icon"></div>
        <div class="brand-text">
          <h1>Launch Lens</h1>
          <p>Insights</p>
        </div>
      </div>
      <div class="document-type">Business Idea Validation Report</div>
    </div>

    <div class="cover-main">
      <div class="idea-title-section">
        <h1 class="idea-title">${data.ideaName}</h1>
        <p class="idea-subtitle">Comprehensive Market Analysis & Strategic Assessment</p>
      </div>

      <div class="score-showcase">
        <div class="score-container">
          <div class="score-value">${data.score.toFixed(1)}</div>
          <div class="score-max">/ 10</div>
        </div>
        <div class="score-label">${getScoreLabel(data.score)}</div>
        <div class="confidence-indicator">
          <div class="confidence-bar">
            <div class="confidence-fill" style="width: ${(data.score / 10) * 100}%"></div>
          </div>
          <span class="confidence-text">${getConfidenceLevel(data.score)} Confidence</span>
        </div>
      </div>

      <div class="report-metadata">
        <div class="metadata-grid">
          <div class="metadata-item">
            <span class="metadata-label">Analysis Date</span>
            <span class="metadata-value">${data.analysisDate}</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-label">Report Generated</span>
            <span class="metadata-value">${format(new Date(), 'MMM d, yyyy')}</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-label">Document Type</span>
            <span class="metadata-value">Validation Report</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-label">Status</span>
            <span class="metadata-value">${getRecommendationStatus(data.recommendation, data.score)}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="cover-footer">
      <div class="confidentiality-notice">
        <div class="confidential-badge">CONFIDENTIAL</div>
        <p>This report contains proprietary and confidential information intended solely for the recipient. Unauthorized distribution, reproduction, or disclosure is strictly prohibited.</p>
      </div>
      <div class="footer-branding">
        <p>Powered by Launch Lens Insights • Professional Business Analysis Platform</p>
      </div>
    </div>
  `;
  return page;
};

export const createEnhancedTableOfContents = (): HTMLElement => {
  const page = document.createElement('div');
  page.className = 'enhanced-toc-page';
  
  const sections = [
    { title: 'Executive Summary', page: 3, description: 'Key findings and strategic recommendation' },
    { title: 'Market Insights & Metrics', page: 4, description: 'Critical business metrics and market indicators' },
    { title: 'Market Analysis', page: 5, description: 'TAM/SAM/SOM analysis and growth projections' },
    { title: 'Competitive Landscape', page: 7, description: 'Competition analysis and positioning strategy' },
    { title: 'Financial Assessment', page: 9, description: 'Financial projections and investment requirements' },
    { title: 'SWOT Analysis', page: 11, description: 'Strengths, weaknesses, opportunities, and threats' },
    { title: 'Detailed Score Breakdown', page: 12, description: 'Category-by-category performance analysis' },
    { title: 'Strategic Action Plan', page: 13, description: 'Prioritized recommendations and implementation roadmap' },
    { title: 'Implementation Timeline', page: 14, description: 'Phased approach to market entry' },
    { title: 'Risk Assessment & Mitigation', page: 15, description: 'Potential challenges and mitigation strategies' }
  ];

  page.innerHTML = `
    <div class="toc-header">
      <h1 class="toc-title">Table of Contents</h1>
      <div class="toc-subtitle">Navigate through your comprehensive business analysis</div>
    </div>

    <div class="toc-content">
      ${sections.map((section, index) => `
        <div class="toc-item">
          <div class="toc-item-main">
            <div class="toc-number">${String(index + 1).padStart(2, '0')}</div>
            <div class="toc-details">
              <h3 class="toc-section-title">${section.title}</h3>
              <p class="toc-description">${section.description}</p>
            </div>
          </div>
          <div class="toc-page">Page ${section.page}</div>
        </div>
      `).join('')}
    </div>

    <div class="reading-guide">
      <h3 class="guide-title">How to Read This Report</h3>
      <div class="guide-grid">
        <div class="guide-item">
          <div class="guide-icon">📊</div>
          <div class="guide-text">
            <strong>Scores:</strong> Rated 1-10 scale with 10 being optimal
          </div>
        </div>
        <div class="guide-item">
          <div class="guide-icon">🟢</div>
          <div class="guide-text">
            <strong>Green:</strong> Positive indicators and strengths
          </div>
        </div>
        <div class="guide-item">
          <div class="guide-icon">🟡</div>
          <div class="guide-text">
            <strong>Yellow:</strong> Areas requiring attention
          </div>
        </div>
        <div class="guide-item">
          <div class="guide-icon">🔴</div>
          <div class="guide-text">
            <strong>Red:</strong> High-risk factors to address
          </div>
        </div>
      </div>
    </div>
  `;
  
  return page;
};

export const createProfessionalExecutiveSummary = (data: ReportData): HTMLElement => {
  const page = document.createElement('div');
  page.className = 'executive-summary-page';
  
  const recommendation = getRecommendationData(data.recommendation, data.score);
  
  page.innerHTML = `
    <div class="section-header">
      <h1 class="section-title">Executive Summary</h1>
      <div class="section-subtitle">Strategic Overview and Key Recommendations</div>
    </div>

    <div class="executive-grid">
      <div class="recommendation-card">
        <div class="rec-header">
          <div class="rec-status-badge" style="background: ${recommendation.bgColor}; color: ${recommendation.color}">
            ${recommendation.status}
          </div>
          <div class="rec-score">
            <span class="score-number" style="color: ${recommendation.color}">${data.score.toFixed(1)}</span>
            <span class="score-max">/10</span>
          </div>
        </div>
        
        <div class="rec-details">
          <div class="rec-metrics">
            <div class="metric">
              <span class="metric-label">Risk Level</span>
              <span class="metric-value" style="color: ${recommendation.color}">${recommendation.risk}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Confidence</span>
              <span class="metric-value" style="color: ${recommendation.color}">${recommendation.confidence}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="key-insights">
        <h3 class="insights-title">Key Strategic Insights</h3>
        <div class="insights-grid">
          <div class="insight-item">
            <div class="insight-icon">🎯</div>
            <div class="insight-content">
              <strong>Market Opportunity:</strong> ${getMarketOpportunityText(data.score)}
            </div>
          </div>
          <div class="insight-item">
            <div class="insight-icon">⚡</div>
            <div class="insight-content">
              <strong>Competitive Edge:</strong> ${getCompetitiveEdgeText(data.score)}
            </div>
          </div>
          <div class="insight-item">
            <div class="insight-icon">💰</div>
            <div class="insight-content">
              <strong>Financial Viability:</strong> ${getFinancialViabilityText(data.score)}
            </div>
          </div>
          <div class="insight-item">
            <div class="insight-icon">🚀</div>
            <div class="insight-content">
              <strong>Growth Potential:</strong> ${getGrowthPotentialText(data.score)}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="summary-content">
      <h3 class="content-title">Business Concept Overview</h3>
      <p class="summary-text">${data.executiveSummary}</p>
    </div>

    <div class="recommendation-content">
      <h3 class="content-title">Strategic Recommendation</h3>
      <p class="recommendation-text">${data.recommendation}</p>
    </div>

    <div class="next-steps-preview">
      <h3 class="content-title">Immediate Next Steps</h3>
      <div class="steps-grid">
        <div class="step-item priority-high">
          <div class="step-number">1</div>
          <div class="step-content">
            <strong>Market Validation:</strong> Conduct targeted customer interviews
          </div>
        </div>
        <div class="step-item priority-medium">
          <div class="step-number">2</div>
          <div class="step-content">
            <strong>MVP Development:</strong> Build minimum viable product
          </div>
        </div>
        <div class="step-item priority-medium">
          <div class="step-number">3</div>
          <div class="step-content">
            <strong>Financial Planning:</strong> Secure initial funding requirements
          </div>
        </div>
      </div>
    </div>
  `;
  
  return page;
};

// Helper functions
const getScoreLabel = (score: number): string => {
  if (score >= 8.5) return 'Exceptional Opportunity';
  if (score >= 7.5) return 'Strong Potential';
  if (score >= 6.5) return 'Promising Prospect';
  if (score >= 5.5) return 'Moderate Potential';
  if (score >= 4.5) return 'Needs Improvement';
  return 'High Risk';
};

const getConfidenceLevel = (score: number): string => {
  if (score >= 8) return 'High';
  if (score >= 6) return 'Moderate';
  return 'Low';
};

const getRecommendationStatus = (recommendation: string, score: number): string => {
  if (score >= 8) return 'Proceed with Confidence';
  if (score >= 6) return 'Proceed with Caution';
  return 'Requires Strategic Pivot';
};

const getRecommendationData = (rec: string, score: number) => {
  if (score >= 8) {
    return {
      status: "PROCEED",
      color: "#059669",
      bgColor: "#dcfce7",
      risk: "Low Risk",
      confidence: "High Confidence"
    };
  } else if (score >= 6) {
    return {
      status: "PROCEED WITH CAUTION",
      color: "#d97706",
      bgColor: "#fef3c7",
      risk: "Medium Risk",
      confidence: "Moderate Confidence"
    };
  } else {
    return {
      status: "HIGH RISK",
      color: "#dc2626",
      bgColor: "#fee2e2",
      risk: "High Risk",
      confidence: "Low Confidence"
    };
  }
};

const getMarketOpportunityText = (score: number): string => {
  if (score >= 8) return 'Large addressable market with clear demand signals';
  if (score >= 6) return 'Moderate market size with growth potential';
  return 'Limited market opportunity requiring validation';
};

const getCompetitiveEdgeText = (score: number): string => {
  if (score >= 8) return 'Strong differentiation with defensible advantages';
  if (score >= 6) return 'Some competitive advantages, needs strengthening';
  return 'Weak competitive position, requires significant differentiation';
};

const getFinancialViabilityText = (score: number): string => {
  if (score >= 8) return 'Strong revenue model with clear path to profitability';
  if (score >= 6) return 'Viable business model with moderate funding needs';
  return 'Unclear monetization strategy, high capital requirements';
};

const getGrowthPotentialText = (score: number): string => {
  if (score >= 8) return 'High scalability with multiple expansion opportunities';
  if (score >= 6) return 'Moderate growth potential in core market';
  return 'Limited scalability, market size constraints';
};
