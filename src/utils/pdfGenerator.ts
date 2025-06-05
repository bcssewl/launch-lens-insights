
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

const captureElementAsImage = async (element: HTMLElement): Promise<string> => {
  try {
    // Ensure element is visible and has dimensions
    if (element.offsetWidth === 0 || element.offsetHeight === 0) {
      throw new Error('Element has no dimensions');
    }

    const canvas = await html2canvas(element, {
      scale: 1, // Reduce scale to avoid memory issues
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      logging: false,
      ignoreElements: (element) => {
        // Ignore certain elements that might cause issues
        return element.classList.contains('ignore-pdf');
      }
    });
    
    return canvas.toDataURL('image/png', 0.8); // Reduce quality slightly for smaller file size
  } catch (error) {
    console.error('Error capturing element:', error);
    throw error;
  }
};

const addImageToPDF = (pdf: jsPDF, imageData: string, yPosition: number, maxWidth?: number): number => {
  try {
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 10;
    const availableWidth = maxWidth || (pageWidth - 2 * margin);
    
    // Create a temporary image to get actual dimensions
    const tempImg = new Image();
    tempImg.src = imageData;
    
    // Calculate dimensions maintaining aspect ratio
    const imgAspectRatio = tempImg.naturalHeight / tempImg.naturalWidth;
    const imgWidth = Math.min(availableWidth, pageWidth - 2 * margin);
    const imgHeight = imgWidth * imgAspectRatio;
    
    // Check if image fits on current page
    if (yPosition + imgHeight > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
    
    // Add image with proper error handling
    pdf.addImage(imageData, 'PNG', margin, yPosition, imgWidth, imgHeight);
    return yPosition + imgHeight + 10;
  } catch (error) {
    console.error('Error adding image to PDF:', error);
    return yPosition + 50; // Return some offset to continue
  }
};

const activateTab = async (tabValue: string): Promise<void> => {
  return new Promise((resolve) => {
    try {
      const tabTrigger = document.querySelector(`button[value="${tabValue}"]`) as HTMLButtonElement;
      if (tabTrigger && !tabTrigger.getAttribute('data-state')?.includes('active')) {
        tabTrigger.click();
        // Wait longer for tab content to fully render
        setTimeout(resolve, 1000);
      } else {
        resolve();
      }
    } catch (error) {
      console.error('Error activating tab:', error);
      resolve();
    }
  });
};

export const generateReportPDF = async (data: ReportData) => {
  try {
    console.log('Starting PDF generation...');
    const pdf = new jsPDF('p', 'mm', 'a4');
    let yPosition = 20;
    const pageWidth = pdf.internal.pageSize.width;
    const margin = 20;

    // Helper function to add text safely
    const addText = (text: string, x: number, y: number, options: any = {}) => {
      try {
        const maxWidth = options.maxWidth || pageWidth - 2 * margin;
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y);
        return y + (lines.length * (options.lineHeight || 7));
      } catch (error) {
        console.error('Error adding text:', error);
        return y + 10;
      }
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
    try {
      const resultsHeader = document.querySelector('[data-results-header]') as HTMLElement;
      if (resultsHeader) {
        console.log('Capturing results header...');
        pdf.addPage();
        yPosition = 20;
        
        const headerImage = await captureElementAsImage(resultsHeader);
        yPosition = addImageToPDF(pdf, headerImage, yPosition);
      }
    } catch (error) {
      console.error('Error capturing results header:', error);
    }

    // Define all tabs that need to be captured
    const tabsToCapture = [
      { value: 'overview', selector: '[data-tab-overview]', title: 'Overview' },
      { value: 'market', selector: '[data-tab-market]', title: 'Market Analysis' },
      { value: 'competition', selector: '[data-tab-competition]', title: 'Competition Analysis' },
      { value: 'financial', selector: '[data-tab-financial]', title: 'Financial Analysis' },
      { value: 'swot', selector: '[data-tab-swot]', title: 'SWOT Analysis' },
      { value: 'scores', selector: '[data-tab-scores]', title: 'Detailed Scores' },
      { value: 'actions', selector: '[data-tab-actions]', title: 'Action Items' }
    ];

    // Capture each tab by activating it first
    for (const tab of tabsToCapture) {
      try {
        console.log(`Processing tab: ${tab.title}`);
        
        // Activate the tab and wait for content to load
        await activateTab(tab.value);
        
        // Find the tab content element
        const element = document.querySelector(tab.selector) as HTMLElement;
        if (element && element.offsetWidth > 0 && element.offsetHeight > 0) {
          console.log(`Capturing ${tab.title} content...`);
          
          pdf.addPage();
          yPosition = 20;
          
          // Add section title
          pdf.setFontSize(16);
          pdf.setFont('helvetica', 'bold');
          yPosition = addText(tab.title, margin, yPosition);
          yPosition += 10;
          
          // Capture and add the tab content
          const tabImage = await captureElementAsImage(element);
          yPosition = addImageToPDF(pdf, tabImage, yPosition);
          
          console.log(`Successfully captured ${tab.title}`);
        } else {
          console.warn(`Tab content not found or has no dimensions: ${tab.title}`);
        }
      } catch (error) {
        console.error(`Error capturing ${tab.title}:`, error);
        // Continue with next tab even if one fails
      }
    }

    // Save the PDF
    const fileName = `${data.ideaName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_validation_report.pdf`;
    pdf.save(fileName);
    console.log('PDF generation completed successfully');
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Fallback to text-based PDF
    generateTextBasedPDF(data);
  }
};

// Fallback function for text-based PDF if screenshot capture fails
const generateTextBasedPDF = (data: ReportData) => {
  try {
    console.log('Generating fallback text-based PDF...');
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
    console.log('Fallback PDF generated successfully');
  } catch (error) {
    console.error('Error generating fallback PDF:', error);
  }
};
