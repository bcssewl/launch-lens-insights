import { ReportData } from './types';
import { getScoreColor, getScoreLabel, getRecommendationStyle } from './pdfHelpers';
import { createChartElement } from './chartCreators';

export const createCoverPage = (data: ReportData): HTMLElement => {
  const coverPage = document.createElement('div');
  coverPage.style.cssText = `
    min-height: 297mm;
    padding: 30mm 20mm;
    text-align: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    page-break-after: always;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  `;
  
  coverPage.innerHTML = `
    <div style="margin-bottom: 50px;">
      <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 12px; margin: 0 auto 25px; display: flex; align-items: center; justify-content: center;">
        <div style="width: 30px; height: 30px; background: white; border-radius: 6px;"></div>
      </div>
      <h1 style="font-size: 40px; font-weight: 700; margin-bottom: 15px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
        Business Validation Report
      </h1>
      <h2 style="font-size: 28px; font-weight: 600; margin-bottom: 30px; opacity: 0.95;">
        ${data.ideaName}
      </h2>
    </div>
    
    <div style="background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); padding: 30px; border-radius: 16px; margin: 30px 0; border: 1px solid rgba(255,255,255,0.2);">
      <div style="font-size: 60px; font-weight: 800; color: ${getScoreColor(data.score)}; margin-bottom: 10px; text-shadow: 0 2px 8px rgba(0,0,0,0.2);">
        ${data.score.toFixed(1)}/10
      </div>
      <div style="font-size: 20px; font-weight: 500; opacity: 0.9;">Validation Score</div>
    </div>
    
    <div style="margin-top: 50px; font-size: 16px; opacity: 0.8;">
      <p style="margin-bottom: 8px;"><strong>Analysis Date:</strong> ${data.analysisDate}</p>
      <p style="margin-bottom: 8px;"><strong>Report Generated:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      <p><strong>Document Classification:</strong> Confidential Business Analysis</p>
    </div>
  `;

  return coverPage;
};

export const createTableOfContents = (): HTMLElement => {
  const tocPage = document.createElement('div');
  tocPage.style.cssText = `
    min-height: 297mm;
    padding: 30mm 20mm;
    page-break-after: always;
  `;
  tocPage.innerHTML = `
    <h1 style="font-size: 32px; font-weight: 700; color: #1a1a1a; margin-bottom: 30px; border-bottom: 3px solid #667eea; padding-bottom: 12px;">
      Table of Contents
    </h1>
    <div style="font-size: 14px; line-height: 2.2;">
      <div style="display: flex; justify-content: between; margin-bottom: 12px; border-bottom: 1px dotted #ccc; padding-bottom: 8px;">
        <span style="font-weight: 600;">Executive Summary</span>
        <span style="margin-left: auto;">3</span>
      </div>
      <div style="display: flex; justify-content: between; margin-bottom: 12px; border-bottom: 1px dotted #ccc; padding-bottom: 8px;">
        <span style="font-weight: 600;">Key Metrics & Insights</span>
        <span style="margin-left: auto;">4</span>
      </div>
      <div style="display: flex; justify-content: between; margin-bottom: 12px; border-bottom: 1px dotted #ccc; padding-bottom: 8px;">
        <span style="font-weight: 600;">Market Analysis</span>
        <span style="margin-left: auto;">5</span>
      </div>
      <div style="display: flex; justify-content: between; margin-bottom: 12px; border-bottom: 1px dotted #ccc; padding-bottom: 8px;">
        <span style="font-weight: 600;">Financial Analysis</span>
        <span style="margin-left: auto;">7</span>
      </div>
      <div style="display: flex; justify-content: between; margin-bottom: 12px; border-bottom: 1px dotted #ccc; padding-bottom: 8px;">
        <span style="font-weight: 600;">Competitive Analysis</span>
        <span style="margin-left: auto;">9</span>
      </div>
      <div style="display: flex; justify-content: between; margin-bottom: 12px; border-bottom: 1px dotted #ccc; padding-bottom: 8px;">
        <span style="font-weight: 600;">SWOT Analysis</span>
        <span style="margin-left: auto;">11</span>
      </div>
      <div style="display: flex; justify-content: between; margin-bottom: 12px; border-bottom: 1px dotted #ccc; padding-bottom: 8px;">
        <span style="font-weight: 600;">Detailed Score Breakdown</span>
        <span style="margin-left: auto;">12</span>
      </div>
      <div style="display: flex; justify-content: between; margin-bottom: 12px; border-bottom: 1px dotted #ccc; padding-bottom: 8px;">
        <span style="font-weight: 600;">Action Items & Recommendations</span>
        <span style="margin-left: auto;">13</span>
      </div>
    </div>
  `;

  return tocPage;
};

export const createExecutiveSummary = (data: ReportData): HTMLElement => {
  const executivePage = document.createElement('div');
  executivePage.style.cssText = `
    min-height: 297mm;
    padding: 30mm 20mm;
    page-break-after: always;
  `;
  
  const recStyle = getRecommendationStyle(data.recommendation, data.score);

  executivePage.innerHTML = `
    <h1 style="font-size: 32px; font-weight: 700; color: #1a1a1a; margin-bottom: 30px; border-bottom: 3px solid #667eea; padding-bottom: 12px;">
      Executive Summary
    </h1>
    
    <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 30px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #e2e8f0;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px;">
        <div>
          <h2 style="font-size: 20px; font-weight: 600; color: #1e293b; margin-bottom: 12px;">Strategic Recommendation</h2>
          <div style="background: ${recStyle.bg}; color: ${recStyle.color}; padding: 10px 20px; border-radius: 6px; font-weight: 700; font-size: 14px; display: inline-block;">
            ${recStyle.status}
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 40px; font-weight: 800; color: ${getScoreColor(data.score)}; line-height: 1;">
            ${data.score.toFixed(1)}
          </div>
          <div style="font-size: 12px; color: #64748b; margin-top: 3px;">out of 10</div>
        </div>
      </div>
    </div>

    <div style="margin-bottom: 30px;">
      <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 15px;">Business Concept Overview</h3>
      <p style="font-size: 14px; line-height: 1.6; color: #374151; text-align: justify;">
        ${data.executiveSummary}
      </p>
    </div>

    <div style="margin-bottom: 30px;">
      <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 15px;">Detailed Analysis & Recommendation</h3>
      <p style="font-size: 14px; line-height: 1.6; color: #374151; text-align: justify;">
        ${data.recommendation}
      </p>
    </div>
  `;

  return executivePage;
};

export const createKeyMetricsPage = (data: ReportData): HTMLElement => {
  const keyMetricsPage = document.createElement('div');
  keyMetricsPage.style.cssText = `
    min-height: 297mm;
    padding: 30mm 20mm;
    page-break-after: always;
  `;
  
  keyMetricsPage.innerHTML = `
    <h1 style="font-size: 32px; font-weight: 700; color: #1a1a1a; margin-bottom: 30px; border-bottom: 3px solid #667eea; padding-bottom: 12px;">
      Key Metrics & Insights
    </h1>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-bottom: 30px;">
      <div style="background: #f8fafc; padding: 25px; border-radius: 10px; text-align: center; border-left: 5px solid #3b82f6;">
        <div style="font-size: 20px; margin-bottom: 8px;">📊</div>
        <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Market Size</div>
        <div style="font-size: 20px; font-weight: 700; color: #1e293b;">${data.keyMetrics?.marketSize?.value || 'Large'}</div>
      </div>
      <div style="background: #f8fafc; padding: 25px; border-radius: 10px; text-align: center; border-left: 5px solid #10b981;">
        <div style="font-size: 20px; margin-bottom: 8px;">⚔️</div>
        <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Competition Level</div>
        <div style="font-size: 20px; font-weight: 700; color: #1e293b;">${data.keyMetrics?.competitionLevel?.value || 'Moderate'}</div>
      </div>
      <div style="background: #f8fafc; padding: 25px; border-radius: 10px; text-align: center; border-left: 5px solid #f59e0b;">
        <div style="font-size: 20px; margin-bottom: 8px;">🎯</div>
        <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Problem Clarity</div>
        <div style="font-size: 20px; font-weight: 700; color: #1e293b;">${data.keyMetrics?.problemClarity?.value || 'High'}</div>
      </div>
      <div style="background: #f8fafc; padding: 25px; border-radius: 10px; text-align: center; border-left: 5px solid #8b5cf6;">
        <div style="font-size: 20px; margin-bottom: 8px;">💰</div>
        <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Revenue Potential</div>
        <div style="font-size: 20px; font-weight: 700; color: #1e293b;">${data.keyMetrics?.revenuePotential?.value || 'High'}</div>
      </div>
    </div>
  `;

  return keyMetricsPage;
};

export const createMarketAnalysisPages = (data: ReportData): HTMLElement[] => {
  const pages: HTMLElement[] = [];

  // Market Analysis Page 1
  const marketAnalysisPage = document.createElement('div');
  marketAnalysisPage.style.cssText = `
    min-height: 297mm;
    padding: 30mm 20mm;
    page-break-after: always;
  `;
  
  const marketAnalysisContent = document.createElement('div');
  marketAnalysisContent.innerHTML = `
    <h1 style="font-size: 32px; font-weight: 700; color: #1a1a1a; margin-bottom: 30px; border-bottom: 3px solid #667eea; padding-bottom: 12px;">
      Market Analysis
    </h1>
    
    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 20px; font-weight: 600; color: #1e293b; margin-bottom: 15px;">Total Addressable Market</h2>
    </div>
  `;
  
  // Add optimized TAM/SAM/SOM chart
  if (data.marketAnalysis?.tamSamSom?.length > 0) {
    const tamChart = createChartElement('pie', data.marketAnalysis.tamSamSom);
    marketAnalysisContent.appendChild(tamChart);
  }
  
  marketAnalysisContent.innerHTML += `
    <div style="margin-top: 30px;">
      <h2 style="font-size: 20px; font-weight: 600; color: #1e293b; margin-bottom: 15px;">Market Growth Trend</h2>
    </div>
  `;
  
  // Add optimized Market Growth chart
  if (data.marketAnalysis?.marketGrowth?.length > 0) {
    const growthChart = createChartElement('line', data.marketAnalysis.marketGrowth);
    marketAnalysisContent.appendChild(growthChart);
  }
  
  marketAnalysisPage.appendChild(marketAnalysisContent);
  pages.push(marketAnalysisPage);

  // Market Analysis Page 2
  const marketAnalysisPage2 = document.createElement('div');
  marketAnalysisPage2.style.cssText = `
    min-height: 297mm;
    padding: 30mm 20mm;
    page-break-after: always;
  `;
  
  const marketAnalysisContent2 = document.createElement('div');
  marketAnalysisContent2.innerHTML = `
    <h1 style="font-size: 32px; font-weight: 700; color: #1a1a1a; margin-bottom: 30px; border-bottom: 3px solid #667eea; padding-bottom: 12px;">
      Market Analysis (Continued)
    </h1>
    
    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 20px; font-weight: 600; color: #1e293b; margin-bottom: 15px;">Customer Segments</h2>
    </div>
  `;
  
  // Add optimized Customer Segments chart
  if (data.marketAnalysis?.customerSegments?.length > 0) {
    const segmentsChart = createChartElement('pie', data.marketAnalysis.customerSegments);
    marketAnalysisContent2.appendChild(segmentsChart);
  }
  
  marketAnalysisPage2.appendChild(marketAnalysisContent2);
  pages.push(marketAnalysisPage2);

  return pages;
};

export const createSWOTAnalysisPage = (data: ReportData): HTMLElement => {
  const swotPage = document.createElement('div');
  swotPage.style.cssText = `
    min-height: 297mm;
    padding: 30mm 20mm;
    page-break-after: always;
  `;
  
  const swotSections = [
    {
      title: 'Strengths',
      items: data.swot?.strengths || ['Strong technical team', 'Clear market need', 'Innovative approach'],
      color: '#10b981',
      bgColor: '#dcfce7',
      icon: '💪'
    },
    {
      title: 'Weaknesses', 
      items: data.swot?.weaknesses || ['Limited funding', 'No brand recognition', 'Small team'],
      color: '#ef4444',
      bgColor: '#fee2e2',
      icon: '⚠️'
    },
    {
      title: 'Opportunities',
      items: data.swot?.opportunities || ['Growing market', 'Digital transformation', 'Partnership potential'],
      color: '#3b82f6',
      bgColor: '#dbeafe',
      icon: '🚀'
    },
    {
      title: 'Threats',
      items: data.swot?.threats || ['Established competitors', 'Economic uncertainty', 'Technology changes'],
      color: '#f59e0b',
      bgColor: '#fef3c7',
      icon: '⚡'
    }
  ];

  swotPage.innerHTML = `
    <h1 style="font-size: 32px; font-weight: 700; color: #1a1a1a; margin-bottom: 30px; border-bottom: 3px solid #667eea; padding-bottom: 12px;">
      SWOT Analysis
    </h1>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px;">
      ${swotSections.map(section => `
        <div style="background: ${section.bgColor}; padding: 25px; border-radius: 10px; border: 1px solid ${section.color}30;">
          <div style="display: flex; align-items: center; margin-bottom: 15px;">
            <span style="font-size: 20px; margin-right: 12px;">${section.icon}</span>
            <h3 style="font-size: 18px; font-weight: 600; color: ${section.color};">
              ${section.title}
            </h3>
          </div>
          <ul style="list-style: none; padding: 0; margin: 0;">
            ${section.items.map(item => `
              <li style="margin-bottom: 10px; display: flex; align-items: flex-start;">
                <span style="color: ${section.color}; margin-right: 8px; margin-top: 2px;">•</span>
                <span style="font-size: 13px; color: #374151; line-height: 1.4;">${item}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      `).join('')}
    </div>
  `;

  return swotPage;
};

export const createDetailedScoresPage = (data: ReportData): HTMLElement => {
  const scoresPage = document.createElement('div');
  scoresPage.style.cssText = `
    min-height: 297mm;
    padding: 30mm 20mm;
    page-break-after: always;
  `;

  scoresPage.innerHTML = `
    <h1 style="font-size: 32px; font-weight: 700; color: #1a1a1a; margin-bottom: 30px; border-bottom: 3px solid #667eea; padding-bottom: 12px;">
      Detailed Score Breakdown
    </h1>
    
    <div style="margin-bottom: 30px;">
      ${(data.detailedScores || [
        { category: 'Market Opportunity', score: 8.2 },
        { category: 'Problem-Solution Fit', score: 7.8 },
        { category: 'Business Model Viability', score: 7.5 },
        { category: 'Competitive Advantage', score: 6.9 },
        { category: 'Team & Execution', score: 7.2 },
        { category: 'Financial Projections', score: 7.6 },
        { category: 'Risk Assessment', score: 6.8 }
      ]).map(item => `
        <div style="margin-bottom: 25px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 16px; font-weight: 500; color: #1e293b;">${item.category}</span>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 12px; color: #64748b;">
                ${getScoreLabel(item.score)}
              </span>
              <span style="font-size: 18px; font-weight: 700; color: ${getScoreColor(item.score)};">
                ${item.score.toFixed(1)}/10
              </span>
            </div>
          </div>
          <div style="width: 100%; background: #e5e7eb; border-radius: 8px; height: 10px; overflow: hidden;">
            <div style="width: ${(item.score / 10) * 100}%; background: ${getScoreColor(item.score)}; height: 100%; border-radius: 8px; transition: width 0.3s ease;"></div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  return scoresPage;
};

export const createActionItemsPage = (data: ReportData): HTMLElement => {
  const actionItemsPage = document.createElement('div');
  actionItemsPage.style.cssText = `
    min-height: 297mm;
    padding: 30mm 20mm;
    page-break-after: always;
  `;
  
  actionItemsPage.innerHTML = `
    <h1 style="font-size: 32px; font-weight: 700; color: #1a1a1a; margin-bottom: 30px; border-bottom: 3px solid #667eea; padding-bottom: 12px;">
      Action Items & Recommendations
    </h1>
    
    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 20px; font-weight: 600; color: #1e293b; margin-bottom: 15px;">Immediate Actions (Next 30 Days)</h2>
      <div style="margin-bottom: 25px;">
        ${(data.actionItems?.filter(item => item.priority === 'High') || [
          { title: 'Conduct customer validation interviews', description: 'Interview 20-30 potential customers to validate problem-solution fit', effort: 'Medium', impact: 'High', priority: 'High' },
          { title: 'Develop MVP prototype', description: 'Create a minimum viable product to test core functionality', effort: 'High', impact: 'High', priority: 'High' }
        ]).map((item, index) => `
          <div style="background: #fef2f2; border-left: 5px solid #ef4444; padding: 18px; border-radius: 6px; margin-bottom: 12px;">
            <div style="display: flex; justify-content: between; align-items: flex-start; margin-bottom: 8px;">
              <h3 style="font-size: 14px; font-weight: 600; color: #991b1b; margin: 0; flex: 1;">${index + 1}. ${item.title}</h3>
              <div style="display: flex; gap: 8px; margin-left: 15px;">
                <span style="background: #dc2626; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: 500;">HIGH PRIORITY</span>
              </div>
            </div>
            <p style="color: #7f1d1d; margin-bottom: 8px; font-size: 12px;">${item.description}</p>
            <div style="display: flex; gap: 12px; font-size: 11px; color: #991b1b;">
              <span><strong>Effort:</strong> ${item.effort}</span>
              <span><strong>Impact:</strong> ${item.impact}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  return actionItemsPage;
};

export const createFinalRecommendationsPage = (data: ReportData): HTMLElement => {
  const finalPage = document.createElement('div');
  finalPage.style.cssText = `
    min-height: 297mm;
    padding: 30mm 20mm;
  `;
  
  finalPage.innerHTML = `
    <h1 style="font-size: 32px; font-weight: 700; color: #1a1a1a; margin-bottom: 30px; border-bottom: 3px solid #667eea; padding-bottom: 12px;">
      Final Recommendations & Next Steps
    </h1>
    
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px;">
      <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 15px;">Strategic Direction</h2>
      <p style="font-size: 16px; line-height: 1.5; opacity: 0.95;">
        Based on our comprehensive analysis, your business idea shows strong potential with a validation score of 
        <strong>${data.score.toFixed(1)}/10</strong>. The market opportunity is significant, and your approach addresses 
        a real customer need with innovative solutions.
      </p>
    </div>
    
    <div style="background: #f8fafc; padding: 25px; border-radius: 10px; border: 1px solid #e2e8f0;">
      <h2 style="font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 15px;">Conclusion</h2>
      <p style="font-size: 14px; color: #374151; line-height: 1.5; margin-bottom: 15px;">
        Your business idea demonstrates strong validation potential across multiple dimensions. 
        The combination of market opportunity, clear customer need, and innovative approach positions 
        this venture for success.
      </p>
      <p style="font-size: 14px; color: #374151; line-height: 1.5;">
        We recommend proceeding with the development while maintaining focus on customer validation 
        and competitive differentiation. Regular review and adaptation of the strategy will be crucial 
        for long-term success.
      </p>
    </div>
    
    <div style="margin-top: 30px; padding-top: 25px; border-top: 2px solid #e2e8f0; text-center; color: #64748b;">
      <p style="font-size: 12px; margin-bottom: 4px;">
        This report was generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
      <p style="font-size: 11px; color: #9ca3af;">
        Confidential Business Analysis - For Internal Use Only
      </p>
    </div>
  `;

  return finalPage;
};
