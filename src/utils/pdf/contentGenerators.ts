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
        <span style="font-weight: 600;">Risk Assessment</span>
        <span style="margin-left: auto;">12</span>
      </div>
      <div style="display: flex; justify-content: between; margin-bottom: 12px; border-bottom: 1px dotted #ccc; padding-bottom: 8px;">
        <span style="font-weight: 600;">Detailed Score Breakdown</span>
        <span style="margin-left: auto;">13</span>
      </div>
      <div style="display: flex; justify-content: between; margin-bottom: 12px; border-bottom: 1px dotted #ccc; padding-bottom: 8px;">
        <span style="font-weight: 600;">Action Items & Recommendations</span>
        <span style="margin-left: auto;">14</span>
      </div>
      <div style="display: flex; justify-content: between; margin-bottom: 12px; border-bottom: 1px dotted #ccc; padding-bottom: 8px;">
        <span style="font-weight: 600;">Implementation Timeline</span>
        <span style="margin-left: auto;">16</span>
      </div>
      <div style="display: flex; justify-content: between; margin-bottom: 12px; border-bottom: 1px dotted #ccc; padding-bottom: 8px;">
        <span style="font-weight: 600;">Final Recommendations</span>
        <span style="margin-left: auto;">17</span>
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

export const createFinancialAnalysisPages = (data: ReportData): HTMLElement[] => {
  const pages: HTMLElement[] = [];

  // Financial Analysis Page 1
  const financialPage1 = document.createElement('div');
  financialPage1.style.cssText = `
    min-height: 297mm;
    padding: 30mm 20mm;
    page-break-after: always;
  `;
  
  financialPage1.innerHTML = `
    <h1 style="font-size: 32px; font-weight: 700; color: #1a1a1a; margin-bottom: 30px; border-bottom: 3px solid #667eea; padding-bottom: 12px;">
      Financial Analysis
    </h1>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-bottom: 30px;">
      <div style="background: #f8fafc; padding: 25px; border-radius: 10px; text-align: center; border-left: 5px solid #3b82f6;">
        <div style="font-size: 20px; margin-bottom: 8px;">💰</div>
        <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Startup Cost</div>
        <div style="font-size: 20px; font-weight: 700; color: #1e293b;">$${data.financialAnalysis?.startupCost?.toLocaleString() || '50,000'}</div>
      </div>
      <div style="background: #f8fafc; padding: 25px; border-radius: 10px; text-align: center; border-left: 5px solid #10b981;">
        <div style="font-size: 20px; margin-bottom: 8px;">🔥</div>
        <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Monthly Burn Rate</div>
        <div style="font-size: 20px; font-weight: 700; color: #1e293b;">$${data.financialAnalysis?.monthlyBurn?.toLocaleString() || '15,000'}/mo</div>
      </div>
      <div style="background: #f8fafc; padding: 25px; border-radius: 10px; text-align: center; border-left: 5px solid #f59e0b;">
        <div style="font-size: 20px; margin-bottom: 8px;">📈</div>
        <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Break-even Month</div>
        <div style="font-size: 20px; font-weight: 700; color: #1e293b;">Month ${data.financialAnalysis?.breakEvenMonth || '18'}</div>
      </div>
      <div style="background: #f8fafc; padding: 25px; border-radius: 10px; text-align: center; border-left: 5px solid #8b5cf6;">
        <div style="font-size: 20px; margin-bottom: 8px;">💸</div>
        <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Funding Needed</div>
        <div style="font-size: 20px; font-weight: 700; color: #1e293b;">$${data.financialAnalysis?.fundingNeeded?.toLocaleString() || '500,000'}</div>
      </div>
    </div>
    
    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 20px; font-weight: 600; color: #1e293b; margin-bottom: 15px;">Revenue Projections</h2>
    </div>
  `;
  
  pages.push(financialPage1);

  // Financial Analysis Page 2
  const financialPage2 = document.createElement('div');
  financialPage2.style.cssText = `
    min-height: 297mm;
    padding: 30mm 20mm;
    page-break-after: always;
  `;
  
  financialPage2.innerHTML = `
    <h1 style="font-size: 32px; font-weight: 700; color: #1a1a1a; margin-bottom: 30px; border-bottom: 3px solid #667eea; padding-bottom: 12px;">
      Financial Analysis (Continued)
    </h1>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-bottom: 30px;">
      <div style="background: #f0f9ff; padding: 20px; border-radius: 10px; border: 1px solid #e0f2fe;">
        <h3 style="font-size: 16px; font-weight: 600; color: #0c4a6e; margin-bottom: 15px;">Customer Acquisition</h3>
        <div style="margin-bottom: 12px;">
          <span style="font-size: 12px; color: #64748b;">Customer Acquisition Cost (CAC)</span>
          <div style="font-size: 18px; font-weight: 700; color: #0c4a6e;">$${data.financialAnalysis?.cac || '75'}</div>
        </div>
        <div>
          <span style="font-size: 12px; color: #64748b;">Customer Lifetime Value (LTV)</span>
          <div style="font-size: 18px; font-weight: 700; color: #0c4a6e;">$${data.financialAnalysis?.ltv?.toLocaleString() || '1,200'}</div>
        </div>
      </div>
      <div style="background: #f0fdf4; padding: 20px; border-radius: 10px; border: 1px solid #dcfce7;">
        <h3 style="font-size: 16px; font-weight: 600; color: #14532d; margin-bottom: 15px;">Business Metrics</h3>
        <div style="margin-bottom: 12px;">
          <span style="font-size: 12px; color: #64748b;">Gross Margin</span>
          <div style="font-size: 18px; font-weight: 700; color: #14532d;">${data.financialAnalysis?.grossMargin || '75'}%</div>
        </div>
        <div>
          <span style="font-size: 12px; color: #64748b;">MRR Growth Rate</span>
          <div style="font-size: 18px; font-weight: 700; color: #14532d;">${data.financialAnalysis?.mrrGrowth || '15'}% monthly</div>
        </div>
      </div>
    </div>
  `;
  
  pages.push(financialPage2);

  return pages;
};

export const createCompetitiveAnalysisPages = (data: ReportData): HTMLElement[] => {
  const pages: HTMLElement[] = [];

  // Competitive Analysis Page 1
  const competitivePage1 = document.createElement('div');
  competitivePage1.style.cssText = `
    min-height: 297mm;
    padding: 30mm 20mm;
    page-break-after: always;
  `;
  
  const competitors = data.competition?.competitors || [
    { name: 'Competitor A', funding: '$2.5M', similarity: 85 },
    { name: 'Competitor B', funding: '$1.2M', similarity: 72 },
    { name: 'Competitor C', funding: '$850K', similarity: 68 }
  ];
  
  competitivePage1.innerHTML = `
    <h1 style="font-size: 32px; font-weight: 700; color: #1a1a1a; margin-bottom: 30px; border-bottom: 3px solid #667eea; padding-bottom: 12px;">
      Competitive Analysis
    </h1>
    
    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 20px; font-weight: 600; color: #1e293b; margin-bottom: 15px;">Key Competitors</h2>
      <div style="background: #f8fafc; padding: 20px; border-radius: 10px; border: 1px solid #e2e8f0;">
        ${competitors.map(comp => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid #e2e8f0;">
            <div>
              <div style="font-size: 16px; font-weight: 600; color: #1e293b;">${comp.name}</div>
              <div style="font-size: 12px; color: #64748b;">Funding: ${comp.funding}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 14px; font-weight: 600; color: #ef4444;">${comp.similarity}% Similar</div>
              <div style="width: 60px; background: #e5e7eb; border-radius: 4px; height: 6px; margin-top: 4px;">
                <div style="width: ${comp.similarity}%; background: #ef4444; height: 100%; border-radius: 4px;"></div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    
    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 20px; font-weight: 600; color: #1e293b; margin-bottom: 15px;">Market Saturation</h2>
      <div style="background: #fef3c7; padding: 20px; border-radius: 10px; border-left: 5px solid #f59e0b;">
        <div style="font-size: 14px; color: #92400e; line-height: 1.5;">
          ${data.competition?.marketSaturation || 'The market shows moderate saturation with several established players, but there is still room for innovative solutions that address unmet customer needs.'}
        </div>
      </div>
    </div>
  `;
  
  pages.push(competitivePage1);

  // Competitive Analysis Page 2
  const competitivePage2 = document.createElement('div');
  competitivePage2.style.cssText = `
    min-height: 297mm;
    padding: 30mm 20mm;
    page-break-after: always;
  `;
  
  const advantages = data.competition?.competitiveAdvantages || [
    'First-mover advantage in specific niche',
    'Superior technology architecture',
    'Strong team expertise',
    'Strategic partnerships',
    'Cost-effective solution'
  ];
  
  competitivePage2.innerHTML = `
    <h1 style="font-size: 32px; font-weight: 700; color: #1a1a1a; margin-bottom: 30px; border-bottom: 3px solid #667eea; padding-bottom: 12px;">
      Competitive Analysis (Continued)
    </h1>
    
    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 20px; font-weight: 600; color: #1e293b; margin-bottom: 15px;">Competitive Advantages</h2>
      <div style="background: #dcfce7; padding: 25px; border-radius: 10px; border-left: 5px solid #10b981;">
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${advantages.map(advantage => `
            <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
              <span style="color: #10b981; margin-right: 10px; margin-top: 2px;">✓</span>
              <span style="font-size: 14px; color: #14532d; line-height: 1.4;">${advantage}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    </div>
  `;
  
  pages.push(competitivePage2);

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
  
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'High':
        return { bg: '#fef2f2', color: '#991b1b', border: '#ef4444', label: 'HIGH PRIORITY' };
      case 'Medium':
        return { bg: '#fef3c7', color: '#92400e', border: '#f59e0b', label: 'MEDIUM PRIORITY' };
      case 'Low':
        return { bg: '#dcfce7', color: '#166534', border: '#10b981', label: 'LOW PRIORITY' };
      default:
        return { bg: '#f3f4f6', color: '#374151', border: '#9ca3af', label: 'PRIORITY' };
    }
  };

  const defaultItems = [
    { title: 'Conduct customer validation interviews', description: 'Interview 20-30 potential customers to validate problem-solution fit', effort: 'Medium', impact: 'High', priority: 'High' },
    { title: 'Develop MVP prototype', description: 'Create a minimum viable product to test core functionality', effort: 'High', impact: 'High', priority: 'High' },
    { title: 'Market research and competitor analysis', description: 'Analyze market trends and identify key competitors', effort: 'Medium', impact: 'Medium', priority: 'Medium' },
    { title: 'Financial planning and budgeting', description: 'Create detailed financial projections and budget allocation', effort: 'Medium', impact: 'Medium', priority: 'Medium' },
    { title: 'Documentation and knowledge base', description: 'Create comprehensive documentation for future reference', effort: 'Low', impact: 'Medium', priority: 'Low' }
  ];

  const items = data.actionItems || defaultItems;
  
  actionItemsPage.innerHTML = `
    <h1 style="font-size: 32px; font-weight: 700; color: #1a1a1a; margin-bottom: 30px; border-bottom: 3px solid #667eea; padding-bottom: 12px;">
      Action Items & Recommendations
    </h1>
    
    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 20px; font-weight: 600; color: #1e293b; margin-bottom: 15px;">Immediate Actions (Next 30 Days)</h2>
      <div style="margin-bottom: 25px;">
        ${items.map((item, index) => {
          const style = getPriorityStyle(item.priority);
          return `
            <div style="background: ${style.bg}; border-left: 5px solid ${style.border}; padding: 18px; border-radius: 6px; margin-bottom: 12px;">
              <div style="display: flex; justify-content: between; align-items: flex-start; margin-bottom: 8px;">
                <h3 style="font-size: 14px; font-weight: 600; color: ${style.color}; margin: 0; flex: 1;">${index + 1}. ${item.title}</h3>
                <div style="display: flex; gap: 8px; margin-left: 15px;">
                  <span style="background: ${style.border}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: 500;">${style.label}</span>
                </div>
              </div>
              <p style="color: ${style.color}; margin-bottom: 8px; font-size: 12px;">${item.description}</p>
              <div style="display: flex; gap: 12px; font-size: 11px; color: ${style.color};">
                <span><strong>Effort:</strong> ${item.effort}</span>
                <span><strong>Impact:</strong> ${item.impact}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  return actionItemsPage;
};

export const createRiskAssessmentPage = (data: ReportData): HTMLElement => {
  const riskPage = document.createElement('div');
  riskPage.style.cssText = `
    min-height: 297mm;
    padding: 30mm 20mm;
    page-break-after: always;
  `;
  
  const risks = data.riskAssessment?.risks || [
    { category: 'Market Risk', level: 'Medium', description: 'Market adoption may be slower than expected due to customer education needs' },
    { category: 'Technology Risk', level: 'Low', description: 'Core technology is proven and scalable with minimal technical risks' },
    { category: 'Competitive Risk', level: 'High', description: 'Large competitors may enter the market with significant resources' },
    { category: 'Financial Risk', level: 'Medium', description: 'Funding requirements may increase if customer acquisition costs are higher' },
    { category: 'Regulatory Risk', level: 'Low', description: 'Minimal regulatory barriers in target markets' }
  ];
  
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'High': return { bg: '#fee2e2', color: '#991b1b', border: '#ef4444' };
      case 'Medium': return { bg: '#fef3c7', color: '#92400e', border: '#f59e0b' };
      case 'Low': return { bg: '#dcfce7', color: '#166534', border: '#10b981' };
      default: return { bg: '#f3f4f6', color: '#374151', border: '#9ca3af' };
    }
  };
  
  riskPage.innerHTML = `
    <h1 style="font-size: 32px; font-weight: 700; color: #1a1a1a; margin-bottom: 30px; border-bottom: 3px solid #667eea; padding-bottom: 12px;">
      Risk Assessment
    </h1>
    
    <div style="margin-bottom: 30px;">
      ${risks.map(risk => {
        const riskStyle = getRiskColor(risk.level);
        return `
          <div style="background: ${riskStyle.bg}; padding: 20px; border-radius: 10px; border-left: 5px solid ${riskStyle.border}; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <h3 style="font-size: 16px; font-weight: 600; color: ${riskStyle.color}; margin: 0;">${risk.category}</h3>
              <span style="background: ${riskStyle.border}; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                ${risk.level.toUpperCase()} RISK
              </span>
            </div>
            <p style="font-size: 14px; color: ${riskStyle.color}; margin: 0; line-height: 1.4;">${risk.description}</p>
          </div>
        `;
      }).join('')}
    </div>
  `;

  return riskPage;
};

export const createImplementationTimelinePage = (data: ReportData): HTMLElement => {
  const timelinePage = document.createElement('div');
  timelinePage.style.cssText = `
    min-height: 297mm;
    padding: 30mm 20mm;
    page-break-after: always;
  `;
  
  const timeline = data.implementation?.timeline || [
    {
      phase: 'Phase 1: Foundation',
      timeline: '0-3 months',
      tasks: ['Complete market validation', 'Finalize MVP development', 'Secure initial funding', 'Build core team']
    },
    {
      phase: 'Phase 2: Launch',
      timeline: '3-6 months',
      tasks: ['Launch beta version', 'Acquire first 100 customers', 'Iterate based on feedback', 'Establish partnerships']
    },
    {
      phase: 'Phase 3: Growth',
      timeline: '6-12 months',
      tasks: ['Scale marketing efforts', 'Expand to new markets', 'Raise Series A funding', 'Build advanced features']
    },
    {
      phase: 'Phase 4: Scale',
      timeline: '12+ months',
      tasks: ['International expansion', 'Strategic acquisitions', 'IPO preparation', 'Market leadership']
    }
  ];
  
  timelinePage.innerHTML = `
    <h1 style="font-size: 32px; font-weight: 700; color: #1a1a1a; margin-bottom: 30px; border-bottom: 3px solid #667eea; padding-bottom: 12px;">
      Implementation Timeline
    </h1>
    
    <div style="margin-bottom: 30px;">
      ${timeline.map((phase, index) => `
        <div style="background: #f8fafc; padding: 25px; border-radius: 10px; border-left: 5px solid #667eea; margin-bottom: 25px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">${phase.phase}</h3>
            <span style="background: #667eea; color: white; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;">
              ${phase.timeline}
            </span>
          </div>
          <div style="margin-bottom: 15px;">
            <h4 style="font-size: 14px; font-weight: 600; color: #475569; margin-bottom: 10px;">Key Tasks:</h4>
            <ul style="list-style: none; padding: 0; margin: 0;">
              ${phase.tasks.map(task => `
                <li style="margin-bottom: 8px; display: flex; align-items: flex-start;">
                  <span style="color: #667eea; margin-right: 8px; margin-top: 2px;">•</span>
                  <span style="font-size: 13px; color: #374151; line-height: 1.4;">${task}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  return timelinePage;
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
