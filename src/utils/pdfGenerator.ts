
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ReportData {
  ideaName: string;
  score: number;
  recommendation: string;
  analysisDate: string;
  executiveSummary: string;
  keyMetrics: {
    marketSize: { value: string; label?: string };
    competitionLevel: { value: string; subValue?: string };
    problemClarity: { value: string };
    revenuePotential: { value: string };
  };
  marketAnalysis: {
    tamSamSom: { name: string; value: number }[];
    marketGrowth: { year: string; growth: number }[];
    customerSegments: { name: string; value: number }[];
    geographicOpportunity: { name: string; value: number }[];
  };
  competition: {
    competitors: any[];
    competitiveAdvantages: any[];
    marketSaturation: string;
  };
  financialAnalysis: {
    keyMetrics: {
      totalStartupCost: number;
      monthlyBurnRate: number;
      breakEvenMonth: number;
      fundingNeeded: number;
    };
  };
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  detailedScores: { category: string; score: number }[];
  actionItems: { title: string; description: string; effort: string; impact: string }[];
}

const captureElement = async (element: HTMLElement): Promise<string> => {
  try {
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight,
    });
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error capturing element:', error);
    throw error;
  }
};

const addImageToPDF = (pdf: jsPDF, imageData: string, yPosition: number): number => {
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 10;
  const maxWidth = pageWidth - 2 * margin;
  
  // Create a temporary image to get dimensions
  const img = new Image();
  img.src = imageData;
  
  const imgWidth = maxWidth;
  const imgHeight = (img.height * maxWidth) / img.width;
  
  // Check if image fits on current page
  if (yPosition + imgHeight > pageHeight - margin) {
    pdf.addPage();
    yPosition = margin;
  }
  
  pdf.addImage(imageData, 'PNG', margin, yPosition, imgWidth, imgHeight);
  return yPosition + imgHeight + 10;
};

export const generateReportPDF = async (data: ReportData) => {
  try {
    const pdf = new jsPDF();
    let yPosition = 20;
    const pageWidth = pdf.internal.pageSize.width;
    const margin = 20;

    // Helper function to add text
    const addText = (text: string, x: number, y: number, options: any = {}) => {
      const maxWidth = options.maxWidth || pageWidth - 2 * margin;
      const lines = pdf.splitTextToSize(text, maxWidth);
      pdf.text(lines, x, y);
      return y + (lines.length * (options.lineHeight || 7));
    };

    // Title page
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    yPosition = addText('Business Idea Validation Report', margin, yPosition, { lineHeight: 10 });
    
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'normal');
    yPosition = addText(data.ideaName, margin, yPosition + 10, { lineHeight: 8 });

    pdf.setFontSize(12);
    yPosition = addText(`Analysis Date: ${data.analysisDate}`, margin, yPosition + 10);
    yPosition = addText(`Overall Score: ${data.score.toFixed(1)}/10`, margin, yPosition + 5);

    // Capture Results Header
    const resultsHeader = document.querySelector('[data-results-header]') as HTMLElement;
    if (resultsHeader) {
      pdf.addPage();
      yPosition = 20;
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      yPosition = addText('Results Overview', margin, yPosition);
      
      const headerImage = await captureElement(resultsHeader);
      yPosition = addImageToPDF(pdf, headerImage, yPosition + 10);
    }

    // Capture each tab content
    const tabContents = [
      { selector: '[data-tab-overview]', title: 'Overview' },
      { selector: '[data-tab-market]', title: 'Market Analysis' },
      { selector: '[data-tab-competition]', title: 'Competition Analysis' },
      { selector: '[data-tab-financial]', title: 'Financial Analysis' },
      { selector: '[data-tab-swot]', title: 'SWOT Analysis' },
      { selector: '[data-tab-scores]', title: 'Detailed Scores' },
      { selector: '[data-tab-actions]', title: 'Action Items' }
    ];

    for (const tab of tabContents) {
      const element = document.querySelector(tab.selector) as HTMLElement;
      if (element && element.offsetHeight > 0) {
        pdf.addPage();
        yPosition = 20;
        
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        yPosition = addText(tab.title, margin, yPosition);
        
        try {
          const tabImage = await captureElement(element);
          yPosition = addImageToPDF(pdf, tabImage, yPosition + 10);
        } catch (error) {
          console.error(`Error capturing ${tab.title}:`, error);
          // Fallback to text if image capture fails
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'normal');
          addText(`Unable to capture ${tab.title} visualization`, margin, yPosition + 10);
        }
      }
    }

    // Save the PDF
    const fileName = `${data.ideaName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_validation_report.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Fallback to text-based PDF
    generateTextBasedPDF(data);
  }
};

// Fallback function for text-based PDF if screenshot capture fails
const generateTextBasedPDF = (data: ReportData) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const margin = 20;
  let yPosition = 30;

  const addText = (text: string, x: number, y: number, options: any = {}) => {
    const maxWidth = options.maxWidth || pageWidth - 2 * margin;
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + (lines.length * (options.lineHeight || 7));
  };

  // Title page
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  yPosition = addText('Business Idea Validation Report', margin, yPosition, { lineHeight: 10 });
  
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'normal');
  yPosition = addText(data.ideaName, margin, yPosition + 10, { lineHeight: 8 });

  pdf.setFontSize(12);
  yPosition = addText(`Analysis Date: ${data.analysisDate}`, margin, yPosition + 10);
  yPosition = addText(`Overall Score: ${data.score.toFixed(1)}/10`, margin, yPosition + 5);
  yPosition = addText(`Recommendation: ${data.recommendation}`, margin, yPosition + 5);

  // Executive Summary
  pdf.addPage();
  yPosition = 30;
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  yPosition = addText('Executive Summary', margin, yPosition);
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  yPosition = addText(data.executiveSummary, margin, yPosition + 10, { lineHeight: 6 });

  const fileName = `${data.ideaName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_validation_report_text.pdf`;
  pdf.save(fileName);
};
