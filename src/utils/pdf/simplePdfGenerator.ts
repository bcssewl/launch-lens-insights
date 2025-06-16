
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ReportData } from './types';
import { waitForFonts, createPDFStyles } from './pdfHelpers';

const createSimplePDFContent = (data: ReportData): string => {
  const getScoreColor = (score: number) => {
    if (score >= 8) return '#059669';
    if (score >= 6) return '#d97706';
    return '#dc2626';
  };

  const getRecommendationText = (score: number) => {
    if (score >= 8) return 'Highly Recommended - Proceed with Confidence';
    if (score >= 6) return 'Proceed with Caution - Address Key Areas';
    return 'High Risk - Consider Pivoting';
  };

  return `
    <div class="pdf-container">
      <!-- Header Section -->
      <div class="pdf-header">
        <div class="pdf-title">${data.ideaName}</div>
        <div class="pdf-subtitle">Business Idea Validation Report</div>
        <div class="pdf-score" style="color: ${getScoreColor(data.score)}">${data.score.toFixed(1)}/10</div>
        <div style="font-size: 14pt; color: ${getScoreColor(data.score)}; font-weight: bold;">
          ${getRecommendationText(data.score)}
        </div>
        <div style="margin-top: 20px; font-size: 12pt; color: #64748b;">
          Analysis Date: ${data.analysisDate} | Generated: ${new Date().toLocaleDateString()}
        </div>
      </div>

      <!-- Executive Summary -->
      <div class="pdf-section">
        <div class="pdf-section-title">Executive Summary</div>
        <p style="font-size: 12pt; line-height: 1.6; margin-bottom: 20px;">
          ${data.executiveSummary}
        </p>
        <p style="font-size: 12pt; line-height: 1.6; color: #374151;">
          <strong>Recommendation:</strong> ${data.recommendation}
        </p>
      </div>

      <!-- Key Metrics -->
      <div class="pdf-section">
        <div class="pdf-section-title">Key Business Metrics</div>
        <div class="pdf-metric-grid">
          <div class="pdf-metric-card">
            <div class="pdf-metric-label">Market Size</div>
            <div class="pdf-metric-value">${data.keyMetrics?.marketSize?.value || 'N/A'}</div>
          </div>
          <div class="pdf-metric-card">
            <div class="pdf-metric-label">Competition Level</div>
            <div class="pdf-metric-value">${data.keyMetrics?.competitionLevel?.value || 'N/A'}</div>
          </div>
          <div class="pdf-metric-card">
            <div class="pdf-metric-label">Problem Clarity</div>
            <div class="pdf-metric-value">${data.keyMetrics?.problemClarity?.value || 'N/A'}</div>
          </div>
          <div class="pdf-metric-card">
            <div class="pdf-metric-label">Revenue Potential</div>
            <div class="pdf-metric-value">${data.keyMetrics?.revenuePotential?.value || 'N/A'}</div>
          </div>
        </div>
      </div>

      <!-- Market Analysis -->
      ${data.marketAnalysis ? `
      <div class="pdf-section">
        <div class="pdf-section-title">Market Analysis</div>
        ${data.marketAnalysis.tamSamSom && data.marketAnalysis.tamSamSom.length > 0 ? `
        <div style="margin-bottom: 20px;">
          <h4 style="font-size: 14pt; margin-bottom: 10px;">Market Size (TAM/SAM/SOM)</h4>
          <table class="pdf-table">
            <thead>
              <tr>
                <th>Market Type</th>
                <th>Value (USD)</th>
              </tr>
            </thead>
            <tbody>
              ${data.marketAnalysis.tamSamSom.map((item: any) => `
                <tr>
                  <td>${item.name}</td>
                  <td>$${item.value?.toLocaleString() || 'N/A'}M</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}
        
        ${data.marketAnalysis.customerSegments && data.marketAnalysis.customerSegments.length > 0 ? `
        <div>
          <h4 style="font-size: 14pt; margin-bottom: 10px;">Customer Segments</h4>
          <ul class="pdf-list">
            ${data.marketAnalysis.customerSegments.map((segment: any) => `
              <li class="pdf-list-item">${segment.name}: ${segment.value}%</li>
            `).join('')}
          </ul>
        </div>
        ` : ''}
      </div>
      ` : ''}

      <!-- SWOT Analysis -->
      ${data.swot ? `
      <div class="pdf-section page-break">
        <div class="pdf-section-title">SWOT Analysis</div>
        <div class="pdf-metric-grid">
          <div class="pdf-metric-card" style="border-left: 4px solid #059669;">
            <div class="pdf-metric-label" style="color: #059669; font-weight: bold;">Strengths</div>
            <ul class="pdf-list">
              ${(data.swot.strengths || []).map((item: string) => `<li class="pdf-list-item">${item}</li>`).join('')}
              ${(data.swot.strengths || []).length === 0 ? '<li class="pdf-list-item" style="color: #9ca3af;">No strengths identified</li>' : ''}
            </ul>
          </div>
          <div class="pdf-metric-card" style="border-left: 4px solid #dc2626;">
            <div class="pdf-metric-label" style="color: #dc2626; font-weight: bold;">Weaknesses</div>
            <ul class="pdf-list">
              ${(data.swot.weaknesses || []).map((item: string) => `<li class="pdf-list-item">${item}</li>`).join('')}
              ${(data.swot.weaknesses || []).length === 0 ? '<li class="pdf-list-item" style="color: #9ca3af;">No weaknesses identified</li>' : ''}
            </ul>
          </div>
          <div class="pdf-metric-card" style="border-left: 4px solid #2563eb;">
            <div class="pdf-metric-label" style="color: #2563eb; font-weight: bold;">Opportunities</div>
            <ul class="pdf-list">
              ${(data.swot.opportunities || []).map((item: string) => `<li class="pdf-list-item">${item}</li>`).join('')}
              ${(data.swot.opportunities || []).length === 0 ? '<li class="pdf-list-item" style="color: #9ca3af;">No opportunities identified</li>' : ''}
            </ul>
          </div>
          <div class="pdf-metric-card" style="border-left: 4px solid #d97706;">
            <div class="pdf-metric-label" style="color: #d97706; font-weight: bold;">Threats</div>
            <ul class="pdf-list">
              ${(data.swot.threats || []).map((item: string) => `<li class="pdf-list-item">${item}</li>`).join('')}
              ${(data.swot.threats || []).length === 0 ? '<li class="pdf-list-item" style="color: #9ca3af;">No threats identified</li>' : ''}
            </ul>
          </div>
        </div>
      </div>
      ` : ''}

      <!-- Detailed Scores -->
      ${data.detailedScores && data.detailedScores.length > 0 ? `
      <div class="pdf-section">
        <div class="pdf-section-title">Detailed Score Breakdown</div>
        <table class="pdf-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Score</th>
              <th>Performance</th>
            </tr>
          </thead>
          <tbody>
            ${data.detailedScores.map((score: any) => {
              const performance = score.score >= 8 ? 'Excellent' : score.score >= 6 ? 'Good' : score.score >= 4 ? 'Fair' : 'Poor';
              const color = score.score >= 8 ? '#059669' : score.score >= 6 ? '#d97706' : '#dc2626';
              return `
                <tr>
                  <td>${score.category}</td>
                  <td style="color: ${color}; font-weight: bold;">${score.score.toFixed(1)}/10</td>
                  <td style="color: ${color};">${performance}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      <!-- Action Items -->
      ${data.actionItems && data.actionItems.length > 0 ? `
      <div class="pdf-section">
        <div class="pdf-section-title">Recommended Action Items</div>
        <ul class="pdf-list">
          ${data.actionItems.map((item: any, index: number) => `
            <li class="pdf-list-item">
              <strong>${index + 1}. ${item.title || item.action || 'Action Item'}</strong>
              ${item.description ? `<br><span style="color: #64748b; margin-left: 30px;">${item.description}</span>` : ''}
              ${item.priority ? `<br><span style="color: #2563eb; margin-left: 30px; font-size: 10pt;">Priority: ${item.priority}</span>` : ''}
            </li>
          `).join('')}
        </ul>
      </div>
      ` : ''}

      <!-- Footer -->
      <div class="pdf-footer">
        <p><strong>Launch Lens Insights</strong> - Professional Business Analysis Platform</p>
        <p>This report is confidential and intended solely for the recipient.</p>
        <p>Generated on ${new Date().toLocaleString()}</p>
      </div>
    </div>
  `;
};

export const generateSimplePDF = async (data: ReportData): Promise<void> => {
  let container: HTMLElement | null = null;
  
  try {
    console.log('Simple PDF: Starting generation for:', data.ideaName);
    
    // Create container element
    container = document.createElement('div');
    container.style.cssText = `
      position: absolute;
      left: -9999px;
      top: 0;
      width: 794px;
      background: #ffffff;
      font-family: 'Inter', sans-serif;
    `;
    
    // Add styles
    const styleElement = document.createElement('style');
    styleElement.textContent = createPDFStyles();
    document.head.appendChild(styleElement);
    
    // Set content
    container.innerHTML = createSimplePDFContent(data);
    
    // Add to document
    document.body.appendChild(container);
    
    // Wait for fonts and layout
    await waitForFonts();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Simple PDF: Generating canvas...');
    
    // Generate canvas with optimized settings
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      width: 794,
      height: container.scrollHeight,
      logging: false,
      onclone: (clonedDoc: Document) => {
        // Ensure styles are applied in cloned document
        const clonedStyle = clonedDoc.createElement('style');
        clonedStyle.textContent = createPDFStyles();
        clonedDoc.head.appendChild(clonedStyle);
      }
    });
    
    console.log('Simple PDF: Canvas generated, creating PDF...');
    
    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    
    // Add first page
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Set PDF properties
    pdf.setProperties({
      title: `${data.ideaName} - Validation Report`,
      subject: 'Business Idea Validation Analysis',
      author: 'Launch Lens Insights',
      creator: 'Launch Lens Platform'
    });
    
    // Save PDF
    const fileName = `${data.ideaName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_validation_report.pdf`;
    pdf.save(fileName);
    
    console.log('Simple PDF: Generated successfully');
    
    // Clean up
    document.head.removeChild(styleElement);
    
  } catch (error) {
    console.error('Simple PDF: Generation failed:', error);
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
};
