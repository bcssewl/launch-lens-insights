
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

const createProfessionalPDFContent = (data: ReportData): HTMLElement => {
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

  // Cover Page
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
  
  const getScoreColor = (score: number) => {
    if (score >= 8) return '#10b981';
    if (score >= 6) return '#f59e0b';
    return '#ef4444';
  };

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

  // Table of Contents
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
        <span style="font-weight: 600;">Competitive Landscape</span>
        <span style="margin-left: auto;">7</span>
      </div>
      <div style="display: flex; justify-content: between; margin-bottom: 15px; border-bottom: 1px dotted #ccc; padding-bottom: 10px;">
        <span style="font-weight: 600;">Financial Analysis</span>
        <span style="margin-left: auto;">9</span>
      </div>
      <div style="display: flex; justify-content: between; margin-bottom: 15px; border-bottom: 1px dotted #ccc; padding-bottom: 10px;">
        <span style="font-weight: 600;">SWOT Analysis</span>
        <span style="margin-left: auto;">11</span>
      </div>
      <div style="display: flex; justify-content: between; margin-bottom: 15px; border-bottom: 1px dotted #ccc; padding-bottom: 10px;">
        <span style="font-weight: 600;">Detailed Score Breakdown</span>
        <span style="margin-left: auto;">12</span>
      </div>
      <div style="display: flex; justify-content: between; margin-bottom: 15px; border-bottom: 1px dotted #ccc; padding-bottom: 10px;">
        <span style="font-weight: 600;">Recommended Actions</span>
        <span style="margin-left: auto;">13</span>
      </div>
    </div>
    
    <div style="margin-top: 60px; padding: 30px; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 12px; border-left: 6px solid #667eea;">
      <h3 style="font-size: 20px; font-weight: 600; color: #1e293b; margin-bottom: 20px;">How to Read This Report</h3>
      <ul style="font-size: 14px; color: #475569; line-height: 1.8; padding-left: 0; list-style: none;">
        <li style="margin-bottom: 8px; padding-left: 20px; position: relative;">
          <span style="position: absolute; left: 0; color: #10b981;">✓</span>
          Scores are rated on a scale of 1-10 (10 being excellent)
        </li>
        <li style="margin-bottom: 8px; padding-left: 20px; position: relative;">
          <span style="position: absolute; left: 0; color: #10b981;">✓</span>
          Green indicators suggest positive factors and opportunities
        </li>
        <li style="margin-bottom: 8px; padding-left: 20px; position: relative;">
          <span style="position: absolute; left: 0; color: #f59e0b;">⚠</span>
          Yellow indicators suggest areas requiring attention
        </li>
        <li style="margin-bottom: 8px; padding-left: 20px; position: relative;">
          <span style="position: absolute; left: 0; color: #ef4444;">⚡</span>
          Red indicators suggest high-risk factors
        </li>
        <li style="margin-bottom: 8px; padding-left: 20px; position: relative;">
          <span style="position: absolute; left: 0; color: #8b5cf6;">★</span>
          Action items are prioritized by impact and feasibility
        </li>
      </ul>
    </div>
  `;

  // Executive Summary
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
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 30px; padding-top: 30px; border-top: 2px solid #e2e8f0;">
        <div>
          <div style="font-size: 14px; font-weight: 600; color: #64748b; margin-bottom: 5px;">RISK ASSESSMENT</div>
          <div style="font-size: 20px; font-weight: 700; color: ${getScoreColor(data.score)};">
            ${data.score >= 8 ? 'Low Risk' : data.score >= 6 ? 'Medium Risk' : 'High Risk'}
          </div>
        </div>
        <div>
          <div style="font-size: 14px; font-weight: 600; color: #64748b; margin-bottom: 5px;">CONFIDENCE LEVEL</div>
          <div style="font-size: 20px; font-weight: 700; color: ${getScoreColor(data.score)};">
            ${data.score >= 8 ? 'High Confidence' : data.score >= 6 ? 'Moderate Confidence' : 'Low Confidence'}
          </div>
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

    <div style="background: #f8fafc; padding: 30px; border-radius: 12px; border-left: 6px solid #667eea;">
      <h4 style="font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 20px;">Key Takeaways</h4>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 14px;">
        <div style="display: flex; align-items: center;">
          <span style="color: #10b981; margin-right: 10px; font-weight: bold;">●</span>
          <span><strong>Primary Strength:</strong> Market opportunity validation</span>
        </div>
        <div style="display: flex; align-items: center;">
          <span style="color: #f59e0b; margin-right: 10px; font-weight: bold;">●</span>
          <span><strong>Main Challenge:</strong> Competitive differentiation</span>
        </div>
        <div style="display: flex; align-items: center;">
          <span style="color: #8b5cf6; margin-right: 10px; font-weight: bold;">●</span>
          <span><strong>Next Step:</strong> Market validation research</span>
        </div>
        <div style="display: flex; align-items: center;">
          <span style="color: #06b6d4; margin-right: 10px; font-weight: bold;">●</span>
          <span><strong>Timeline:</strong> 3-6 months to MVP</span>
        </div>
      </div>
    </div>
  `;

  // Add all sections to container
  const sections = [coverPage, tocPage, executivePage];
  sections.forEach(section => container.appendChild(section));

  return container;
};

const waitForFonts = async (): Promise<void> => {
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  } else {
    // Fallback for browsers that don't support document.fonts
    await new Promise(resolve => setTimeout(resolve, 500));
  }
};

const generatePDF = async (canvas: HTMLCanvasElement, pdf: jsPDF, pageHeight: number): Promise<void> => {
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
    console.log('Starting PDF generation with data:', data);

    // Create the professional PDF content
    content = createProfessionalPDFContent(data);
    document.body.appendChild(content);

    // Wait for fonts to load
    await waitForFonts();

    // Generate canvas with optimized settings
    const canvas = await html2canvas(content, {
      scale: 1.5, // Reduced from 2 for better performance
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 794, // A4 width at 96 DPI
      height: content.scrollHeight,
      logging: false,
      imageTimeout: 15000,
      removeContainer: true,
      onclone: (clonedDoc) => {
        // Ensure all images are loaded in the cloned document
        const images = clonedDoc.getElementsByTagName('img');
        return Promise.all(Array.from(images).map(img => {
          const imgElement = img as HTMLImageElement;
          if (imgElement.complete) return Promise.resolve();
          return new Promise(resolve => {
            imgElement.onload = resolve;
            imgElement.onerror = resolve;
          });
        }));
      }
    });

    // Create PDF with metadata
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.setProperties({
      title: `${data.ideaName} - Business Validation Report`,
      subject: 'Business Idea Validation',
      author: 'Launch Lens Insights',
      keywords: 'business validation, market analysis, startup',
      creator: 'Launch Lens Insights'
    });

    // Generate PDF with proper pagination
    const pageHeight = pdf.internal.pageSize.getHeight();
    const totalHeight = canvas.height;
    const pageCount = Math.ceil(totalHeight / pageHeight);

    for (let i = 0; i < pageCount; i++) {
      if (i > 0) {
        pdf.addPage();
      }
      await generatePDF(canvas, pdf, pageHeight);
    }

    // Generate filename
    const fileName = `${data.ideaName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_business_validation_report.pdf`;
    
    // Download the PDF
    pdf.save(fileName);

    console.log('PDF generated successfully:', fileName);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    // Clean up
    if (content && content.parentNode) {
      content.parentNode.removeChild(content);
    }
  }
};
