
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ReportData {
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

const createChartElement = (type: string, data: any[], config: any = {}): HTMLElement => {
  const container = document.createElement('div');
  container.style.cssText = `
    width: 100%;
    height: 300px;
    margin: 20px 0;
    background: white;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  `;

  if (type === 'pie') {
    return createPieChart(container, data, config);
  } else if (type === 'line') {
    return createLineChart(container, data, config);
  } else if (type === 'bar') {
    return createBarChart(container, data, config);
  }

  return container;
};

const createPieChart = (container: HTMLElement, data: any[], config: any): HTMLElement => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const centerX = 150;
  const centerY = 120;
  const radius = 80;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.cssText = 'width: 100%; height: 240px;';
  
  let currentAngle = 0;
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  data.forEach((item, index) => {
    const percentage = item.value / total;
    const sliceAngle = percentage * 2 * Math.PI;
    
    const x1 = centerX + radius * Math.cos(currentAngle);
    const y1 = centerY + radius * Math.sin(currentAngle);
    const x2 = centerX + radius * Math.cos(currentAngle + sliceAngle);
    const y2 = centerY + radius * Math.sin(currentAngle + sliceAngle);
    
    const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`);
    path.setAttribute('fill', colors[index % colors.length]);
    path.setAttribute('stroke', 'white');
    path.setAttribute('stroke-width', '2');
    
    svg.appendChild(path);
    
    // Add label
    const labelAngle = currentAngle + sliceAngle / 2;
    const labelX = centerX + (radius * 0.7) * Math.cos(labelAngle);
    const labelY = centerY + (radius * 0.7) * Math.sin(labelAngle);
    
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', labelX.toString());
    text.setAttribute('y', labelY.toString());
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', 'white');
    text.setAttribute('font-size', '12');
    text.setAttribute('font-weight', 'bold');
    text.textContent = `${(percentage * 100).toFixed(1)}%`;
    
    svg.appendChild(text);
    
    currentAngle += sliceAngle;
  });

  // Add legend
  const legend = document.createElement('div');
  legend.style.cssText = 'margin-top: 20px; display: flex; flex-wrap: wrap; gap: 15px; justify-content: center;';
  
  data.forEach((item, index) => {
    const legendItem = document.createElement('div');
    legendItem.style.cssText = 'display: flex; align-items: center; gap: 5px; font-size: 12px;';
    
    const colorBox = document.createElement('div');
    colorBox.style.cssText = `width: 12px; height: 12px; background: ${colors[index % colors.length]}; border-radius: 2px;`;
    
    const label = document.createElement('span');
    label.textContent = item.name;
    
    legendItem.appendChild(colorBox);
    legendItem.appendChild(label);
    legend.appendChild(legendItem);
  });

  container.appendChild(svg);
  container.appendChild(legend);
  return container;
};

const createLineChart = (container: HTMLElement, data: any[], config: any): HTMLElement => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.cssText = 'width: 100%; height: 240px;';
  
  const padding = 50;
  const width = 450;
  const height = 180;
  
  const maxValue = Math.max(...data.map(d => d.growth || d.value || 0));
  const minValue = Math.min(...data.map(d => d.growth || d.value || 0));
  
  // Draw axes
  const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  xAxis.setAttribute('x1', padding.toString());
  xAxis.setAttribute('y1', (height + padding).toString());
  xAxis.setAttribute('x2', (width + padding).toString());
  xAxis.setAttribute('y2', (height + padding).toString());
  xAxis.setAttribute('stroke', '#374151');
  xAxis.setAttribute('stroke-width', '2');
  svg.appendChild(xAxis);
  
  const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  yAxis.setAttribute('x1', padding.toString());
  yAxis.setAttribute('y1', padding.toString());
  yAxis.setAttribute('x2', padding.toString());
  yAxis.setAttribute('y2', (height + padding).toString());
  yAxis.setAttribute('stroke', '#374151');
  yAxis.setAttribute('stroke-width', '2');
  svg.appendChild(yAxis);
  
  // Draw line
  let pathData = '';
  data.forEach((item, index) => {
    const x = padding + (index * width) / (data.length - 1);
    const value = item.growth || item.value || 0;
    const y = height + padding - ((value - minValue) / (maxValue - minValue)) * height;
    
    if (index === 0) {
      pathData += `M ${x} ${y}`;
    } else {
      pathData += ` L ${x} ${y}`;
    }
    
    // Add data points
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x.toString());
    circle.setAttribute('cy', y.toString());
    circle.setAttribute('r', '4');
    circle.setAttribute('fill', '#3B82F6');
    svg.appendChild(circle);
    
    // Add labels
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x.toString());
    text.setAttribute('y', (height + padding + 20).toString());
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '12');
    text.textContent = item.year || item.name || `${index + 1}`;
    svg.appendChild(text);
  });
  
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', pathData);
  path.setAttribute('stroke', '#3B82F6');
  path.setAttribute('stroke-width', '3');
  path.setAttribute('fill', 'none');
  svg.appendChild(path);
  
  container.appendChild(svg);
  return container;
};

const createBarChart = (container: HTMLElement, data: any[], config: any): HTMLElement => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.cssText = 'width: 100%; height: 240px;';
  
  const padding = 50;
  const width = 400;
  const height = 180;
  const barWidth = width / data.length * 0.6;
  
  const maxValue = Math.max(...data.map(d => d.value || 0));
  
  // Draw axes
  const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  xAxis.setAttribute('x1', padding.toString());
  xAxis.setAttribute('y1', (height + padding).toString());
  xAxis.setAttribute('x2', (width + padding).toString());
  xAxis.setAttribute('y2', (height + padding).toString());
  xAxis.setAttribute('stroke', '#374151');
  xAxis.setAttribute('stroke-width', '2');
  svg.appendChild(xAxis);
  
  const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  yAxis.setAttribute('x1', padding.toString());
  yAxis.setAttribute('y1', padding.toString());
  yAxis.setAttribute('x2', padding.toString());
  yAxis.setAttribute('y2', (height + padding).toString());
  yAxis.setAttribute('stroke', '#374151');
  yAxis.setAttribute('stroke-width', '2');
  svg.appendChild(yAxis);
  
  // Draw bars
  data.forEach((item, index) => {
    const x = padding + (index * width) / data.length + (width / data.length - barWidth) / 2;
    const barHeight = (item.value / maxValue) * height;
    const y = height + padding - barHeight;
    
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x.toString());
    rect.setAttribute('y', y.toString());
    rect.setAttribute('width', barWidth.toString());
    rect.setAttribute('height', barHeight.toString());
    rect.setAttribute('fill', '#3B82F6');
    svg.appendChild(rect);
    
    // Add value labels
    const valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    valueText.setAttribute('x', (x + barWidth / 2).toString());
    valueText.setAttribute('y', (y - 5).toString());
    valueText.setAttribute('text-anchor', 'middle');
    valueText.setAttribute('font-size', '12');
    valueText.setAttribute('font-weight', 'bold');
    valueText.textContent = item.value.toString();
    svg.appendChild(valueText);
    
    // Add category labels
    const categoryText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    categoryText.setAttribute('x', (x + barWidth / 2).toString());
    categoryText.setAttribute('y', (height + padding + 20).toString());
    categoryText.setAttribute('text-anchor', 'middle');
    categoryText.setAttribute('font-size', '11');
    categoryText.textContent = item.name.length > 10 ? item.name.substring(0, 10) + '...' : item.name;
    svg.appendChild(categoryText);
  });
  
  container.appendChild(svg);
  return container;
};

const createComprehensivePDFContent = (data: ReportData): HTMLElement => {
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

  const getScoreColor = (score: number) => {
    if (score >= 8) return '#10b981';
    if (score >= 6) return '#f59e0b';
    return '#ef4444';
  };

  // 1. Cover Page
  const coverPage = document.createElement('div');
  coverPage.style.cssText = `
    min-height: 297mm;
    padding: 40mm 20mm;
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
    <div style="margin-bottom: 60px;">
      <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 16px; margin: 0 auto 30px; display: flex; align-items: center; justify-content: center;">
        <div style="width: 40px; height: 40px; background: white; border-radius: 8px;"></div>
      </div>
      <h1 style="font-size: 48px; font-weight: 700; margin-bottom: 20px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
        Business Idea Validation Report
      </h1>
      <h2 style="font-size: 32px; font-weight: 600; margin-bottom: 40px; opacity: 0.95;">
        ${data.ideaName}
      </h2>
    </div>
    
    <div style="background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); padding: 40px; border-radius: 20px; margin: 40px 0; border: 1px solid rgba(255,255,255,0.2);">
      <div style="font-size: 72px; font-weight: 800; color: ${getScoreColor(data.score)}; margin-bottom: 15px; text-shadow: 0 2px 8px rgba(0,0,0,0.2);">
        ${data.score.toFixed(1)}/10
      </div>
      <div style="font-size: 24px; font-weight: 500; opacity: 0.9;">Validation Score</div>
    </div>
    
    <div style="margin-top: 60px; font-size: 18px; opacity: 0.8;">
      <p style="margin-bottom: 10px;"><strong>Analysis Date:</strong> ${data.analysisDate}</p>
      <p style="margin-bottom: 10px;"><strong>Report Generated:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      <p><strong>Document Classification:</strong> Confidential Business Analysis</p>
    </div>
  `;

  // 2. Table of Contents
  const tocPage = document.createElement('div');
  tocPage.style.cssText = `
    min-height: 297mm;
    padding: 40mm 20mm;
    page-break-after: always;
  `;
  tocPage.innerHTML = `
    <h1 style="font-size: 36px; font-weight: 700; color: #1a1a1a; margin-bottom: 40px; border-bottom: 3px solid #667eea; padding-bottom: 15px;">
      Table of Contents
    </h1>
    <div style="font-size: 16px; line-height: 2.5;">
      <div style="display: flex; justify-content: between; margin-bottom: 15px; border-bottom: 1px dotted #ccc; padding-bottom: 10px;">
        <span style="font-weight: 600;">Executive Summary</span>
        <span style="margin-left: auto;">3</span>
      </div>
      <div style="display: flex; justify-content: between; margin-bottom: 15px; border-bottom: 1px dotted #ccc; padding-bottom: 10px;">
        <span style="font-weight: 600;">Key Metrics & Insights</span>
        <span style="margin-left: auto;">4</span>
      </div>
      <div style="display: flex; justify-content: between; margin-bottom: 15px; border-bottom: 1px dotted #ccc; padding-bottom: 10px;">
        <span style="font-weight: 600;">Market Analysis</span>
        <span style="margin-left: auto;">5</span>
      </div>
      <div style="display: flex; justify-content: between; margin-bottom: 15px; border-bottom: 1px dotted #ccc; padding-bottom: 10px;">
        <span style="font-weight: 600;">Financial Analysis</span>
        <span style="margin-left: auto;">8</span>
      </div>
      <div style="display: flex; justify-content: between; margin-bottom: 15px; border-bottom: 1px dotted #ccc; padding-bottom: 10px;">
        <span style="font-weight: 600;">Competitive Analysis</span>
        <span style="margin-left: auto;">11</span>
      </div>
      <div style="display: flex; justify-content: between; margin-bottom: 15px; border-bottom: 1px dotted #ccc; padding-bottom: 10px;">
        <span style="font-weight: 600;">SWOT Analysis</span>
        <span style="margin-left: auto;">13</span>
      </div>
      <div style="display: flex; justify-content: between; margin-bottom: 15px; border-bottom: 1px dotted #ccc; padding-bottom: 10px;">
        <span style="font-weight: 600;">Detailed Score Breakdown</span>
        <span style="margin-left: auto;">15</span>
      </div>
      <div style="display: flex; justify-content: between; margin-bottom: 15px; border-bottom: 1px dotted #ccc; padding-bottom: 10px;">
        <span style="font-weight: 600;">Action Items & Recommendations</span>
        <span style="margin-left: auto;">17</span>
      </div>
    </div>
  `;

  // 3. Executive Summary
  const executivePage = document.createElement('div');
  executivePage.style.cssText = `
    min-height: 297mm;
    padding: 40mm 20mm;
    page-break-after: always;
  `;
  
  const getRecommendationStyle = (rec: string, score: number) => {
    if (score >= 8) return { bg: '#dcfce7', color: '#166534', status: 'PROCEED' };
    if (score >= 6) return { bg: '#fef3c7', color: '#92400e', status: 'PROCEED WITH CAUTION' };
    return { bg: '#fee2e2', color: '#991b1b', status: 'HIGH RISK' };
  };

  const recStyle = getRecommendationStyle(data.recommendation, data.score);

  executivePage.innerHTML = `
    <h1 style="font-size: 36px; font-weight: 700; color: #1a1a1a; margin-bottom: 40px; border-bottom: 3px solid #667eea; padding-bottom: 15px;">
      Executive Summary
    </h1>
    
    <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 40px; border-radius: 16px; margin-bottom: 40px; border: 1px solid #e2e8f0;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px;">
        <div>
          <h2 style="font-size: 24px; font-weight: 600; color: #1e293b; margin-bottom: 15px;">Strategic Recommendation</h2>
          <div style="background: ${recStyle.bg}; color: ${recStyle.color}; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 16px; display: inline-block;">
            ${recStyle.status}
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 48px; font-weight: 800; color: ${getScoreColor(data.score)}; line-height: 1;">
            ${data.score.toFixed(1)}
          </div>
          <div style="font-size: 14px; color: #64748b; margin-top: 5px;">out of 10</div>
        </div>
      </div>
    </div>

    <div style="margin-bottom: 40px;">
      <h3 style="font-size: 20px; font-weight: 600; color: #1e293b; margin-bottom: 20px;">Business Concept Overview</h3>
      <p style="font-size: 16px; line-height: 1.8; color: #374151; text-align: justify;">
        ${data.executiveSummary}
      </p>
    </div>

    <div style="margin-bottom: 40px;">
      <h3 style="font-size: 20px; font-weight: 600; color: #1e293b; margin-bottom: 20px;">Detailed Analysis & Recommendation</h3>
      <p style="font-size: 16px; line-height: 1.8; color: #374151; text-align: justify;">
        ${data.recommendation}
      </p>
    </div>
  `;

  // 4. Key Metrics Page
  const keyMetricsPage = document.createElement('div');
  keyMetricsPage.style.cssText = `
    min-height: 297mm;
    padding: 40mm 20mm;
    page-break-after: always;
  `;
  
  keyMetricsPage.innerHTML = `
    <h1 style="font-size: 36px; font-weight: 700; color: #1a1a1a; margin-bottom: 40px; border-bottom: 3px solid #667eea; padding-bottom: 15px;">
      Key Metrics & Insights
    </h1>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px;">
      <div style="background: #f8fafc; padding: 30px; border-radius: 12px; text-align: center; border-left: 6px solid #3b82f6;">
        <div style="font-size: 24px; margin-bottom: 10px;">📊</div>
        <div style="font-size: 14px; color: #64748b; margin-bottom: 5px;">Market Size</div>
        <div style="font-size: 24px; font-weight: 700; color: #1e293b;">${data.keyMetrics?.marketSize?.value || 'Large'}</div>
      </div>
      <div style="background: #f8fafc; padding: 30px; border-radius: 12px; text-align: center; border-left: 6px solid #10b981;">
        <div style="font-size: 24px; margin-bottom: 10px;">⚔️</div>
        <div style="font-size: 14px; color: #64748b; margin-bottom: 5px;">Competition Level</div>
        <div style="font-size: 24px; font-weight: 700; color: #1e293b;">${data.keyMetrics?.competitionLevel?.value || 'Moderate'}</div>
      </div>
      <div style="background: #f8fafc; padding: 30px; border-radius: 12px; text-align: center; border-left: 6px solid #f59e0b;">
        <div style="font-size: 24px; margin-bottom: 10px;">🎯</div>
        <div style="font-size: 14px; color: #64748b; margin-bottom: 5px;">Problem Clarity</div>
        <div style="font-size: 24px; font-weight: 700; color: #1e293b;">${data.keyMetrics?.problemClarity?.value || 'High'}</div>
      </div>
      <div style="background: #f8fafc; padding: 30px; border-radius: 12px; text-align: center; border-left: 6px solid #8b5cf6;">
        <div style="font-size: 24px; margin-bottom: 10px;">💰</div>
        <div style="font-size: 14px; color: #64748b; margin-bottom: 5px;">Revenue Potential</div>
        <div style="font-size: 24px; font-weight: 700; color: #1e293b;">${data.keyMetrics?.revenuePotential?.value || 'High'}</div>
      </div>
    </div>
  `;

  // 5. Market Analysis Page
  const marketAnalysisPage = document.createElement('div');
  marketAnalysisPage.style.cssText = `
    min-height: 297mm;
    padding: 40mm 20mm;
    page-break-after: always;
  `;
  
  const marketAnalysisContent = document.createElement('div');
  marketAnalysisContent.innerHTML = `
    <h1 style="font-size: 36px; font-weight: 700; color: #1a1a1a; margin-bottom: 40px; border-bottom: 3px solid #667eea; padding-bottom: 15px;">
      Market Analysis
    </h1>
    
    <div style="margin-bottom: 40px;">
      <h2 style="font-size: 24px; font-weight: 600; color: #1e293b; margin-bottom: 20px;">Total Addressable Market (TAM/SAM/SOM)</h2>
    </div>
  `;
  
  // Add TAM/SAM/SOM chart
  if (data.marketAnalysis?.tamSamSom?.length > 0) {
    const tamChart = createChartElement('pie', data.marketAnalysis.tamSamSom);
    marketAnalysisContent.appendChild(tamChart);
  }
  
  marketAnalysisContent.innerHTML += `
    <div style="margin-top: 40px;">
      <h2 style="font-size: 24px; font-weight: 600; color: #1e293b; margin-bottom: 20px;">Market Growth Trend</h2>
    </div>
  `;
  
  // Add Market Growth chart
  if (data.marketAnalysis?.marketGrowth?.length > 0) {
    const growthChart = createChartElement('line', data.marketAnalysis.marketGrowth);
    marketAnalysisContent.appendChild(growthChart);
  }
  
  marketAnalysisPage.appendChild(marketAnalysisContent);

  // 6. Market Analysis Page 2 (Customer Segments & Geographic)
  const marketAnalysisPage2 = document.createElement('div');
  marketAnalysisPage2.style.cssText = `
    min-height: 297mm;
    padding: 40mm 20mm;
    page-break-after: always;
  `;
  
  const marketAnalysisContent2 = document.createElement('div');
  marketAnalysisContent2.innerHTML = `
    <h1 style="font-size: 36px; font-weight: 700; color: #1a1a1a; margin-bottom: 40px; border-bottom: 3px solid #667eea; padding-bottom: 15px;">
      Market Analysis (Continued)
    </h1>
    
    <div style="margin-bottom: 40px;">
      <h2 style="font-size: 24px; font-weight: 600; color: #1e293b; margin-bottom: 20px;">Customer Segment Breakdown</h2>
    </div>
  `;
  
  // Add Customer Segments chart
  if (data.marketAnalysis?.customerSegments?.length > 0) {
    const segmentsChart = createChartElement('pie', data.marketAnalysis.customerSegments);
    marketAnalysisContent2.appendChild(segmentsChart);
  }
  
  marketAnalysisContent2.innerHTML += `
    <div style="margin-top: 40px;">
      <h2 style="font-size: 24px; font-weight: 600; color: #1e293b; margin-bottom: 20px;">Geographic Opportunity</h2>
    </div>
  `;
  
  // Add Geographic Opportunity chart
  if (data.marketAnalysis?.geographicOpportunity?.length > 0) {
    const geoChart = createChartElement('bar', data.marketAnalysis.geographicOpportunity);
    marketAnalysisContent2.appendChild(geoChart);
  }
  
  marketAnalysisPage2.appendChild(marketAnalysisContent2);

  // 7. Financial Analysis Page 1
  const financialPage1 = document.createElement('div');
  financialPage1.style.cssText = `
    min-height: 297mm;
    padding: 40mm 20mm;
    page-break-after: always;
  `;
  
  financialPage1.innerHTML = `
    <h1 style="font-size: 36px; font-weight: 700; color: #1a1a1a; margin-bottom: 40px; border-bottom: 3px solid #667eea; padding-bottom: 15px;">
      Financial Analysis
    </h1>
    
    <div style="margin-bottom: 40px;">
      <h2 style="font-size: 24px; font-weight: 600; color: #1e293b; margin-bottom: 20px;">Key Financial Metrics</h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
        <div style="background: #f8fafc; padding: 30px; border-radius: 12px; text-align: center; border-left: 6px solid #3b82f6;">
          <div style="font-size: 20px; font-weight: 700; color: #3b82f6;">$${(data.financialAnalysis?.keyMetrics?.totalStartupCost || 50000).toLocaleString()}</div>
          <div style="font-size: 14px; color: #64748b; margin-top: 5px;">Total Startup Cost</div>
        </div>
        <div style="background: #f8fafc; padding: 30px; border-radius: 12px; text-align: center; border-left: 6px solid #ef4444;">
          <div style="font-size: 20px; font-weight: 700; color: #ef4444;">$${(data.financialAnalysis?.keyMetrics?.monthlyBurnRate || 8000).toLocaleString()}</div>
          <div style="font-size: 14px; color: #64748b; margin-top: 5px;">Monthly Burn Rate</div>
        </div>
        <div style="background: #f8fafc; padding: 30px; border-radius: 12px; text-align: center; border-left: 6px solid #10b981;">
          <div style="font-size: 20px; font-weight: 700; color: #10b981;">${data.financialAnalysis?.keyMetrics?.breakEvenMonth || 18} months</div>
          <div style="font-size: 14px; color: #64748b; margin-top: 5px;">Break-even Timeline</div>
        </div>
        <div style="background: #f8fafc; padding: 30px; border-radius: 12px; text-align: center; border-left: 6px solid #8b5cf6;">
          <div style="font-size: 20px; font-weight: 700; color: #8b5cf6;">$${(data.financialAnalysis?.keyMetrics?.fundingNeeded || 150000).toLocaleString()}</div>
          <div style="font-size: 14px; color: #64748b; margin-top: 5px;">Funding Required</div>
        </div>
      </div>
    </div>
    
    <div style="margin-top: 40px;">
      <h2 style="font-size: 24px; font-weight: 600; color: #1e293b; margin-bottom: 20px;">Startup Costs Breakdown</h2>
    </div>
  `;

  // 8. Financial Analysis Page 2 (Charts)
  const financialPage2 = document.createElement('div');
  financialPage2.style.cssText = `
    min-height: 297mm;
    padding: 40mm 20mm;
    page-break-after: always;
  `;
  
  const financialContent2 = document.createElement('div');
  financialContent2.innerHTML = `
    <h1 style="font-size: 36px; font-weight: 700; color: #1a1a1a; margin-bottom: 40px; border-bottom: 3px solid #667eea; padding-bottom: 15px;">
      Financial Analysis (Continued)
    </h1>
    
    <div style="margin-bottom: 40px;">
      <h2 style="font-size: 24px; font-weight: 600; color: #1e293b; margin-bottom: 20px;">Revenue Projections</h2>
    </div>
  `;
  
  // Add Revenue Projections chart
  if (data.financialAnalysis?.revenueProjections?.length > 0) {
    const revenueChart = createChartElement('line', data.financialAnalysis.revenueProjections);
    financialContent2.appendChild(revenueChart);
  }
  
  financialPage2.appendChild(financialContent2);

  // 9. Financial Analysis Page 3
  const financialPage3 = document.createElement('div');
  financialPage3.style.cssText = `
    min-height: 297mm;
    padding: 40mm 20mm;
    page-break-after: always;
  `;
  
  financialPage3.innerHTML = `
    <h1 style="font-size: 36px; font-weight: 700; color: #1a1a1a; margin-bottom: 40px; border-bottom: 3px solid #667eea; padding-bottom: 15px;">
      Financial Viability Assessment
    </h1>
    
    <div style="background: #f0f9ff; padding: 30px; border-radius: 12px; border-left: 6px solid #3b82f6; margin-bottom: 30px;">
      <h3 style="font-size: 20px; font-weight: 600; color: #1e293b; margin-bottom: 20px;">Investment Recommendation</h3>
      <div style="font-size: 18px; font-weight: 600; color: #10b981; margin-bottom: 15px;">✓ Recommended for Investment</div>
      <p style="font-size: 16px; color: #374151; line-height: 1.6;">
        Financial projections show strong potential for profitability within ${data.financialAnalysis?.keyMetrics?.breakEvenMonth || 18} months.
        The required investment of $${(data.financialAnalysis?.keyMetrics?.fundingNeeded || 150000).toLocaleString()} is reasonable for the projected returns.
      </p>
    </div>
    
    <div style="margin-bottom: 30px;">
      <h3 style="font-size: 20px; font-weight: 600; color: #1e293b; margin-bottom: 20px;">Financial Strengths</h3>
      <div style="display: grid; gap: 15px;">
        <div style="background: #dcfce7; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
          <div style="font-weight: 600; color: #166534;">Clear Revenue Model</div>
          <div style="font-size: 14px; color: #15803d; margin-top: 5px;">Multiple income streams identified</div>
        </div>
        <div style="background: #dcfce7; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
          <div style="font-weight: 600; color: #166534;">Reasonable Break-even Timeline</div>
          <div style="font-size: 14px; color: #15803d; margin-top: 5px;">Expected profitability within 18 months</div>
        </div>
        <div style="background: #dcfce7; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
          <div style="font-weight: 600; color: #166534;">Scalable Business Model</div>
          <div style="font-size: 14px; color: #15803d; margin-top: 5px;">High growth potential with digital delivery</div>
        </div>
        <div style="background: #dcfce7; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
          <div style="font-weight: 600; color: #166534;">Manageable Startup Costs</div>
          <div style="font-size: 14px; color: #15803d; margin-top: 5px;">Low barrier to entry with MVP approach</div>
        </div>
      </div>
    </div>
  `;

  // 10. Competition Analysis Page
  const competitionPage = document.createElement('div');
  competitionPage.style.cssText = `
    min-height: 297mm;
    padding: 40mm 20mm;
    page-break-after: always;
  `;
  
  competitionPage.innerHTML = `
    <h1 style="font-size: 36px; font-weight: 700; color: #1a1a1a; margin-bottom: 40px; border-bottom: 3px solid #667eea; padding-bottom: 15px;">
      Competitive Analysis
    </h1>
    
    <div style="margin-bottom: 40px;">
      <h2 style="font-size: 24px; font-weight: 600; color: #1e293b; margin-bottom: 20px;">Market Saturation Level</h2>
      <div style="background: #fef3c7; padding: 30px; border-radius: 12px; text-align: center; border-left: 6px solid #f59e0b;">
        <div style="font-size: 32px; font-weight: 700; color: #d97706; margin-bottom: 10px;">
          ${data.competition?.marketSaturation || 'Moderate'}
        </div>
        <div style="font-size: 16px; color: #92400e;">
          The market shows moderate saturation with opportunities for differentiation
        </div>
      </div>
    </div>
    
    <div style="margin-bottom: 40px;">
      <h2 style="font-size: 24px; font-weight: 600; color: #1e293b; margin-bottom: 20px;">Our Competitive Advantages</h2>
      <div style="display: grid; gap: 15px;">
        ${(data.competition?.competitiveAdvantages || [
          'Innovative technology approach',
          'Strong team expertise',
          'First-mover advantage in niche market',
          'Superior user experience design'
        ]).map(advantage => `
          <div style="background: #dcfce7; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; display: flex; align-items: center;">
            <span style="color: #10b981; margin-right: 15px; font-size: 18px;">✓</span>
            <span style="font-weight: 500; color: #166534;">${advantage}</span>
          </div>
        `).join('')}
      </div>
    </div>
    
    <div style="margin-top: 40px;">
      <h2 style="font-size: 24px; font-weight: 600; color: #1e293b; margin-bottom: 20px;">Competitive Positioning Strategy</h2>
      <div style="background: #f8fafc; padding: 30px; border-radius: 12px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; text-align: center;">
          <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <div style="font-weight: 600; color: #10b981; margin-bottom: 10px;">Price Advantage</div>
            <div style="font-size: 14px; color: #64748b;">Lower cost structure</div>
          </div>
          <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <div style="font-weight: 600; color: #3b82f6; margin-bottom: 10px;">Feature Differentiation</div>
            <div style="font-size: 14px; color: #64748b;">Unique value proposition</div>
          </div>
          <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <div style="font-weight: 600; color: #8b5cf6; margin-bottom: 10px;">Market Focus</div>
            <div style="font-size: 14px; color: #64748b;">Niche targeting</div>
          </div>
        </div>
        <p style="font-size: 14px; color: #64748b; text-align: center; margin-top: 20px; font-style: italic;">
          Recommended strategy: Focus on feature differentiation and niche market targeting
        </p>
      </div>
    </div>
  `;

  // 11. Competition Analysis Page 2
  const competitionPage2 = document.createElement('div');
  competitionPage2.style.cssText = `
    min-height: 297mm;
    padding: 40mm 20mm;
    page-break-after: always;
  `;
  
  competitionPage2.innerHTML = `
    <h1 style="font-size: 36px; font-weight: 700; color: #1a1a1a; margin-bottom: 40px; border-bottom: 3px solid #667eea; padding-bottom: 15px;">
      Competitive Landscape
    </h1>
    
    <div style="margin-bottom: 40px;">
      <h2 style="font-size: 24px; font-weight: 600; color: #1e293b; margin-bottom: 20px;">Key Competitors Analysis</h2>
      <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background: #f8fafc; padding: 15px; border-bottom: 1px solid #e2e8f0;">
          <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 20px; font-weight: 600; color: #1e293b;">
            <div>Competitor</div>
            <div>Market Share</div>
            <div>Pricing</div>
            <div>Strengths</div>
            <div>Weaknesses</div>
          </div>
        </div>
        ${Array.from({length: 3}, (_, i) => `
          <div style="padding: 15px; border-bottom: 1px solid #e2e8f0; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 20px; align-items: center;">
            <div style="font-weight: 500;">Competitor ${i + 1}</div>
            <div style="color: #64748b;">${[15, 23, 12][i]}%</div>
            <div style="color: #64748b;">${['Premium', 'Mid-range', 'Budget'][i]}</div>
            <div style="color: #64748b; font-size: 14px;">${['Brand recognition', 'Cost efficiency', 'Wide reach'][i]}</div>
            <div style="color: #64748b; font-size: 14px;">${['High prices', 'Limited features', 'Poor UX'][i]}</div>
          </div>
        `).join('')}
      </div>
    </div>
    
    <div style="margin-top: 40px;">
      <h2 style="font-size: 24px; font-weight: 600; color: #1e293b; margin-bottom: 20px;">Market Opportunity Gap</h2>
      <div style="background: #eff6ff; padding: 30px; border-radius: 12px; border-left: 6px solid #3b82f6;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e40af; margin-bottom: 15px;">Identified Market Gap</h3>
        <p style="font-size: 16px; color: #1e40af; line-height: 1.6;">
          Current competitors are missing key features that our target customers value most. 
          There's a clear opportunity to capture market share by focusing on user experience 
          and innovative features that address unmet needs in the market.
        </p>
      </div>
    </div>
  `;

  // 12. SWOT Analysis Page
  const swotPage = document.createElement('div');
  swotPage.style.cssText = `
    min-height: 297mm;
    padding: 40mm 20mm;
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
    <h1 style="font-size: 36px; font-weight: 700; color: #1a1a1a; margin-bottom: 40px; border-bottom: 3px solid #667eea; padding-bottom: 15px;">
      SWOT Analysis
    </h1>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
      ${swotSections.map(section => `
        <div style="background: ${section.bgColor}; padding: 30px; border-radius: 12px; border: 1px solid ${section.color}30;">
          <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <span style="font-size: 24px; margin-right: 15px;">${section.icon}</span>
            <h3 style="font-size: 20px; font-weight: 600; color: ${section.color};">
              ${section.title}
            </h3>
          </div>
          <ul style="list-style: none; padding: 0; margin: 0;">
            ${section.items.map(item => `
              <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
                <span style="color: ${section.color}; margin-right: 10px; margin-top: 2px;">•</span>
                <span style="font-size: 15px; color: #374151; line-height: 1.4;">${item}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      `).join('')}
    </div>
  `;

  // 13. Detailed Scores Page
  const scoresPage = document.createElement('div');
  scoresPage.style.cssText = `
    min-height: 297mm;
    padding: 40mm 20mm;
    page-break-after: always;
  `;
  
  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Fair';
    return 'Poor';
  };

  scoresPage.innerHTML = `
    <h1 style="font-size: 36px; font-weight: 700; color: #1a1a1a; margin-bottom: 40px; border-bottom: 3px solid #667eea; padding-bottom: 15px;">
      Detailed Score Breakdown
    </h1>
    
    <div style="margin-bottom: 40px;">
      ${(data.detailedScores || [
        { category: 'Market Opportunity', score: 8.2 },
        { category: 'Problem-Solution Fit', score: 7.8 },
        { category: 'Business Model Viability', score: 7.5 },
        { category: 'Competitive Advantage', score: 6.9 },
        { category: 'Team & Execution', score: 7.2 },
        { category: 'Financial Projections', score: 7.6 },
        { category: 'Risk Assessment', score: 6.8 }
      ]).map(item => `
        <div style="margin-bottom: 30px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="font-size: 18px; font-weight: 500; color: #1e293b;">${item.category}</span>
            <div style="display: flex; align-items: center; gap: 15px;">
              <span style="font-size: 14px; color: #64748b;">
                ${getScoreLabel(item.score)}
              </span>
              <span style="font-size: 20px; font-weight: 700; color: ${getScoreColor(item.score)};">
                ${item.score.toFixed(1)}/10
              </span>
            </div>
          </div>
          <div style="width: 100%; background: #e5e7eb; border-radius: 10px; height: 12px; overflow: hidden;">
            <div style="width: ${(item.score / 10) * 100}%; background: ${getScoreColor(item.score)}; height: 100%; border-radius: 10px; transition: width 0.3s ease;"></div>
          </div>
        </div>
      `).join('')}
    </div>
    
    <div style="background: #f8fafc; padding: 30px; border-radius: 12px; border: 1px solid #e2e8f0;">
      <h3 style="font-size: 20px; font-weight: 600; color: #1e293b; margin-bottom: 20px;">Score Interpretation Guide</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 14px;">
        <div>
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <div style="width: 12px; height: 12px; background: #10b981; border-radius: 2px; margin-right: 10px;"></div>
            <span style="font-weight: 600;">8.0 - 10.0: Excellent</span>
          </div>
          <p style="color: #64748b; margin-left: 22px; margin-bottom: 15px;">Strong competitive advantage</p>
        </div>
        <div>
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <div style="width: 12px; height: 12px; background: #f59e0b; border-radius: 2px; margin-right: 10px;"></div>
            <span style="font-weight: 600;">6.0 - 7.9: Good</span>
          </div>
          <p style="color: #64748b; margin-left: 22px; margin-bottom: 15px;">Above average performance</p>
        </div>
        <div>
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <div style="width: 12px; height: 12px; background: #eab308; border-radius: 2px; margin-right: 10px;"></div>
            <span style="font-weight: 600;">4.0 - 5.9: Fair</span>
          </div>
          <p style="color: #64748b; margin-left: 22px; margin-bottom: 15px;">Needs improvement</p>
        </div>
        <div>
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <div style="width: 12px; height: 12px; background: #ef4444; border-radius: 2px; margin-right: 10px;"></div>
            <span style="font-weight: 600;">0.0 - 3.9: Poor</span>
          </div>
          <p style="color: #64748b; margin-left: 22px;">Significant risks present</p>
        </div>
      </div>
    </div>
  `;

  // 14. Action Items Page
  const actionItemsPage = document.createElement('div');
  actionItemsPage.style.cssText = `
    min-height: 297mm;
    padding: 40mm 20mm;
    page-break-after: always;
  `;
  
  actionItemsPage.innerHTML = `
    <h1 style="font-size: 36px; font-weight: 700; color: #1a1a1a; margin-bottom: 40px; border-bottom: 3px solid #667eea; padding-bottom: 15px;">
      Action Items & Recommendations
    </h1>
    
    <div style="margin-bottom: 40px;">
      <h2 style="font-size: 24px; font-weight: 600; color: #1e293b; margin-bottom: 20px;">Immediate Actions (Next 30 Days)</h2>
      <div style="margin-bottom: 30px;">
        ${(data.actionItems?.filter(item => item.priority === 'High') || [
          { title: 'Conduct customer validation interviews', description: 'Interview 20-30 potential customers to validate problem-solution fit', effort: 'Medium', impact: 'High', priority: 'High' },
          { title: 'Develop MVP prototype', description: 'Create a minimum viable product to test core functionality', effort: 'High', impact: 'High', priority: 'High' }
        ]).map((item, index) => `
          <div style="background: #fef2f2; border-left: 6px solid #ef4444; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
            <div style="display: flex; justify-content: between; align-items: flex-start; margin-bottom: 10px;">
              <h3 style="font-size: 16px; font-weight: 600; color: #991b1b; margin: 0; flex: 1;">${index + 1}. ${item.title}</h3>
              <div style="display: flex; gap: 10px; margin-left: 20px;">
                <span style="background: #dc2626; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">HIGH PRIORITY</span>
              </div>
            </div>
            <p style="color: #7f1d1d; margin-bottom: 10px; font-size: 14px;">${item.description}</p>
            <div style="display: flex; gap: 15px; font-size: 12px; color: #991b1b;">
              <span><strong>Effort:</strong> ${item.effort}</span>
              <span><strong>Impact:</strong> ${item.impact}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    
    <div style="margin-bottom: 40px;">
      <h2 style="font-size: 24px; font-weight: 600; color: #1e293b; margin-bottom: 20px;">Medium-term Goals (3-6 Months)</h2>
      <div style="margin-bottom: 30px;">
        ${(data.actionItems?.filter(item => item.priority === 'Medium') || [
          { title: 'Build strategic partnerships', description: 'Establish partnerships with key industry players', effort: 'Medium', impact: 'Medium', priority: 'Medium' },
          { title: 'Secure initial funding', description: 'Raise seed funding to support product development', effort: 'High', impact: 'High', priority: 'Medium' }
        ]).map((item, index) => `
          <div style="background: #fefbf3; border-left: 6px solid #f59e0b; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
            <div style="display: flex; justify-content: between; align-items: flex-start; margin-bottom: 10px;">
              <h3 style="font-size: 16px; font-weight: 600; color: #92400e; margin: 0; flex: 1;">${index + 1}. ${item.title}</h3>
              <div style="display: flex; gap: 10px; margin-left: 20px;">
                <span style="background: #d97706; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">MEDIUM PRIORITY</span>
              </div>
            </div>
            <p style="color: #78350f; margin-bottom: 10px; font-size: 14px;">${item.description}</p>
            <div style="display: flex; gap: 15px; font-size: 12px; color: #92400e;">
              <span><strong>Effort:</strong> ${item.effort}</span>
              <span><strong>Impact:</strong> ${item.impact}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // 15. Final Recommendations Page
  const finalPage = document.createElement('div');
  finalPage.style.cssText = `
    min-height: 297mm;
    padding: 40mm 20mm;
  `;
  
  finalPage.innerHTML = `
    <h1 style="font-size: 36px; font-weight: 700; color: #1a1a1a; margin-bottom: 40px; border-bottom: 3px solid #667eea; padding-bottom: 15px;">
      Final Recommendations & Next Steps
    </h1>
    
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 16px; margin-bottom: 40px;">
      <h2 style="font-size: 28px; font-weight: 700; margin-bottom: 20px;">Strategic Direction</h2>
      <p style="font-size: 18px; line-height: 1.6; opacity: 0.95;">
        Based on our comprehensive analysis, your business idea shows strong potential with a validation score of 
        <strong>${data.score.toFixed(1)}/10</strong>. The market opportunity is significant, and your approach addresses 
        a real customer need with innovative solutions.
      </p>
    </div>
    
    <div style="margin-bottom: 40px;">
      <h2 style="font-size: 24px; font-weight: 600; color: #1e293b; margin-bottom: 20px;">Key Success Factors</h2>
      <div style="display: grid; gap: 20px;">
        <div style="background: #f0f9ff; border-left: 6px solid #3b82f6; padding: 20px; border-radius: 8px;">
          <h3 style="font-size: 16px; font-weight: 600; color: #1e40af; margin-bottom: 8px;">1. Market Validation</h3>
          <p style="color: #1e40af; font-size: 14px;">Continue validating your assumptions with real customers to ensure product-market fit.</p>
        </div>
        <div style="background: #f0fdf4; border-left: 6px solid #10b981; padding: 20px; border-radius: 8px;">
          <h3 style="font-size: 16px; font-weight: 600; color: #065f46; margin-bottom: 8px;">2. Competitive Differentiation</h3>
          <p style="color: #065f46; font-size: 14px;">Focus on your unique value proposition to stand out in the competitive landscape.</p>
        </div>
        <div style="background: #fffbeb; border-left: 6px solid #f59e0b; padding: 20px; border-radius: 8px;">
          <h3 style="font-size: 16px; font-weight: 600; color: #92400e; margin-bottom: 8px;">3. Financial Management</h3>
          <p style="color: #92400e; font-size: 14px;">Maintain careful control of burn rate and focus on achieving key milestones.</p>
        </div>
      </div>
    </div>
    
    <div style="background: #f8fafc; padding: 30px; border-radius: 12px; border: 1px solid #e2e8f0;">
      <h2 style="font-size: 20px; font-weight: 600; color: #1e293b; margin-bottom: 20px;">Conclusion</h2>
      <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 20px;">
        Your business idea demonstrates strong validation potential across multiple dimensions. 
        The combination of market opportunity, clear customer need, and innovative approach positions 
        this venture for success.
      </p>
      <p style="font-size: 16px; color: #374151; line-height: 1.6;">
        We recommend proceeding with the development while maintaining focus on customer validation 
        and competitive differentiation. Regular review and adaptation of the strategy will be crucial 
        for long-term success.
      </p>
    </div>
    
    <div style="margin-top: 40px; padding-top: 30px; border-top: 2px solid #e2e8f0; text-center; color: #64748b;">
      <p style="font-size: 14px; margin-bottom: 5px;">
        This report was generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
      <p style="font-size: 12px; color: #9ca3af;">
        Confidential Business Analysis - For Internal Use Only
      </p>
    </div>
  `;

  // Add all sections to container
  const sections = [
    coverPage, tocPage, executivePage, keyMetricsPage, 
    marketAnalysisPage, marketAnalysisPage2, 
    financialPage1, financialPage2, financialPage3,
    competitionPage, competitionPage2,
    swotPage, scoresPage, actionItemsPage, finalPage
  ];
  
  sections.forEach(section => container.appendChild(section));

  return container;
};

const waitForFonts = async (): Promise<void> => {
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  } else {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
};

const generatePDF = async (canvas: HTMLCanvasElement, pdf: jsPDF): Promise<void> => {
  const imgData = canvas.toDataURL('image/png', 1.0);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
  const imgX = (pdfWidth - imgWidth * ratio) / 2;
  const imgY = 0;
  
  pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
};

export const generateReportPDF = async (data: ReportData): Promise<void> => {
  let content: HTMLElement | null = null;
  
  try {
    console.log('Starting comprehensive PDF generation with data:', data);

    // Create the comprehensive PDF content with all sections
    content = createComprehensivePDFContent(data);
    document.body.appendChild(content);

    // Wait for fonts to load
    await waitForFonts();

    // Generate canvas with optimized settings
    const canvas = await html2canvas(content, {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 794, // A4 width at 96 DPI
      height: content.scrollHeight,
      logging: false,
      imageTimeout: 15000,
      removeContainer: true,
    });

    // Create PDF with metadata
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.setProperties({
      title: `${data.ideaName} - Comprehensive Business Validation Report`,
      subject: 'Business Idea Validation',
      author: 'Launch Lens Insights',
      keywords: 'business validation, market analysis, startup, comprehensive report',
      creator: 'Launch Lens Insights'
    });

    // Generate PDF pages
    const pageHeight = 297; // A4 height in mm
    const pageWidth = 210; // A4 width in mm
    const contentHeight = canvas.height * 0.264583; // Convert pixels to mm
    const totalPages = Math.ceil(contentHeight / pageHeight);

    for (let i = 0; i < totalPages; i++) {
      if (i > 0) {
        pdf.addPage();
      }
      
      const sourceY = i * (canvas.height / totalPages);
      const sourceHeight = canvas.height / totalPages;
      
      // Create a temporary canvas for this page
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sourceHeight;
      
      const pageCtx = pageCanvas.getContext('2d');
      if (pageCtx) {
        pageCtx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
        
        const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
        pdf.addImage(pageImgData, 'PNG', 0, 0, pageWidth, pageHeight);
      }
    }

    // Generate filename
    const fileName = `${data.ideaName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_comprehensive_validation_report.pdf`;
    
    // Download the PDF
    pdf.save(fileName);

    console.log('Comprehensive PDF generated successfully:', fileName);

  } catch (error) {
    console.error('Error generating comprehensive PDF:', error);
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    // Clean up
    if (content && content.parentNode) {
      content.parentNode.removeChild(content);
    }
  }
};
