
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

const createPDFContent = (data: ReportData): HTMLElement => {
  const container = document.createElement('div');
  container.style.cssText = `
    width: 794px;
    padding: 40px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: white;
    color: #1f2937;
    line-height: 1.6;
    position: absolute;
    left: -9999px;
    top: 0;
  `;

  // Cover Page
  const coverPage = document.createElement('div');
  coverPage.style.cssText = 'text-align: center; margin-bottom: 60px; page-break-after: always;';
  coverPage.innerHTML = `
    <h1 style="font-size: 36px; font-weight: 700; color: #111827; margin-bottom: 20px;">
      Business Idea Validation Report
    </h1>
    <h2 style="font-size: 24px; font-weight: 600; color: #374151; margin-bottom: 40px;">
      ${data.ideaName}
    </h2>
    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); 
                padding: 30px; border-radius: 12px; margin: 40px 0;">
      <div style="font-size: 48px; font-weight: 700; color: #059669; margin-bottom: 10px;">
        ${data.score.toFixed(1)}/10
      </div>
      <div style="font-size: 18px; color: #374151;">Validation Score</div>
    </div>
    <p style="font-size: 16px; color: #6b7280; margin-top: 40px;">
      Generated on ${data.analysisDate}
    </p>
  `;

  // Executive Summary
  const executiveSummary = document.createElement('div');
  executiveSummary.style.cssText = 'margin-bottom: 40px; page-break-inside: avoid;';
  executiveSummary.innerHTML = `
    <h2 style="font-size: 24px; font-weight: 600; color: #1f2937; 
               border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 20px;">
      Executive Summary
    </h2>
    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
      <p style="margin: 0; font-size: 14px; line-height: 1.7;">${data.executiveSummary}</p>
    </div>
    <h3 style="font-size: 18px; font-weight: 600; margin: 20px 0 10px 0;">Key Recommendation</h3>
    <p style="font-size: 14px; color: #4b5563; margin: 0;">${data.recommendation}</p>
  `;

  // Key Metrics
  const keyMetrics = document.createElement('div');
  keyMetrics.style.cssText = 'margin-bottom: 40px; page-break-inside: avoid;';
  const metricsGrid = Object.entries(data.keyMetrics).map(([key, metric]: [string, any]) => `
    <div style="text-align: center; padding: 16px; border: 1px solid #d1d5db; 
                border-radius: 8px; background: #fafafa;">
      <div style="font-size: 18px; font-weight: 700; color: #059669; margin-bottom: 5px;">
        ${metric.value || 'N/A'}
      </div>
      <div style="font-size: 12px; color: #6b7280; font-weight: 500;">
        ${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
      </div>
    </div>
  `).join('');
  
  keyMetrics.innerHTML = `
    <h2 style="font-size: 24px; font-weight: 600; color: #1f2937; 
               border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 20px;">
      Key Metrics
    </h2>
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
      ${metricsGrid}
    </div>
  `;

  // SWOT Analysis
  const swotAnalysis = document.createElement('div');
  swotAnalysis.style.cssText = 'margin-bottom: 40px; page-break-inside: avoid;';
  const createSWOTSection = (title: string, items: string[], color: string) => `
    <div style="background: ${color}; padding: 16px; border-radius: 8px;">
      <h4 style="font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #1f2937;">${title}</h4>
      <ul style="margin: 0; padding-left: 20px;">
        ${items.map(item => `<li style="font-size: 13px; margin-bottom: 4px;">${item}</li>`).join('')}
      </ul>
    </div>
  `;

  swotAnalysis.innerHTML = `
    <h2 style="font-size: 24px; font-weight: 600; color: #1f2937; 
               border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 20px;">
      SWOT Analysis
    </h2>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
      ${createSWOTSection('Strengths', data.swot.strengths || [], '#dcfce7')}
      ${createSWOTSection('Weaknesses', data.swot.weaknesses || [], '#fee2e2')}
      ${createSWOTSection('Opportunities', data.swot.opportunities || [], '#dbeafe')}
      ${createSWOTSection('Threats', data.swot.threats || [], '#fef3c7')}
    </div>
  `;

  // Action Items
  const actionItems = document.createElement('div');
  actionItems.style.cssText = 'margin-bottom: 40px; page-break-inside: avoid;';
  const actionsList = data.actionItems.map((item, index) => `
    <div style="background: #f9fafb; padding: 16px; border-radius: 8px; border-left: 4px solid #3b82f6; margin-bottom: 12px;">
      <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #1f2937;">
        ${index + 1}. ${item.title || item.action || 'Action Item'}
      </h4>
      <p style="font-size: 13px; color: #4b5563; margin: 0;">
        ${item.description || item.details || 'No description available'}
      </p>
      ${item.priority ? `<span style="display: inline-block; margin-top: 8px; padding: 2px 8px; 
        background: #e0f2fe; color: #0369a1; font-size: 11px; border-radius: 4px; font-weight: 500;">
        Priority: ${item.priority}</span>` : ''}
    </div>
  `).join('');

  actionItems.innerHTML = `
    <h2 style="font-size: 24px; font-weight: 600; color: #1f2937; 
               border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 20px;">
      Recommended Actions
    </h2>
    ${actionsList || '<p style="color: #6b7280; font-style: italic;">No action items available</p>'}
  `;

  container.appendChild(coverPage);
  container.appendChild(executiveSummary);
  container.appendChild(keyMetrics);
  container.appendChild(swotAnalysis);
  container.appendChild(actionItems);

  return container;
};

export const generateReportPDF = async (data: ReportData): Promise<void> => {
  try {
    // Create the PDF content
    const content = createPDFContent(data);
    document.body.appendChild(content);

    // Generate canvas from HTML
    const canvas = await html2canvas(content, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 794,
      height: content.scrollHeight
    });

    // Remove the temporary content
    document.body.removeChild(content);

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

    // Download the PDF
    const fileName = `${data.ideaName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_validation_report.pdf`;
    pdf.save(fileName);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try using the print view instead.');
  }
};
