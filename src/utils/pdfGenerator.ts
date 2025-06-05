
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

const captureElementAsImage = async (element: HTMLElement): Promise<string | null> => {
  try {
    console.log('Capturing element:', element.tagName, element.className);
    
    // Ensure element is visible
    if (element.offsetWidth === 0 || element.offsetHeight === 0) {
      console.warn('Element has no dimensions');
      return null;
    }

    // Wait a bit for any animations to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      height: element.scrollHeight,
      width: element.scrollWidth,
    });
    
    return canvas.toDataURL('image/png', 0.9);
  } catch (error) {
    console.error('Error capturing element:', error);
    return null;
  }
};

const addImageToPDF = (pdf: jsPDF, imageData: string, yPosition: number): number => {
  try {
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 10;
    
    // Create image to get dimensions
    const img = new Image();
    img.src = imageData;
    
    // Calculate image dimensions
    const maxWidth = pageWidth - 2 * margin;
    const aspectRatio = img.naturalHeight / img.naturalWidth;
    const imgWidth = Math.min(maxWidth, img.naturalWidth * 0.3); // Scale down for PDF
    const imgHeight = imgWidth * aspectRatio;
    
    // Check if we need a new page
    if (yPosition + imgHeight > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
    
    // Add image to PDF
    pdf.addImage(imageData, 'PNG', margin, yPosition, imgWidth, imgHeight);
    return yPosition + imgHeight + 10;
  } catch (error) {
    console.error('Error adding image to PDF:', error);
    return yPosition + 20;
  }
};

const activateTab = async (tabValue: string): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      console.log(`Attempting to activate tab: ${tabValue}`);
      
      // Find the tab trigger button
      const tabTrigger = document.querySelector(`button[value="${tabValue}"]`) as HTMLButtonElement;
      
      if (tabTrigger) {
        console.log(`Found tab trigger for ${tabValue}`);
        tabTrigger.click();
        
        // Wait for tab content to load
        setTimeout(() => {
          console.log(`Tab ${tabValue} should be active now`);
          resolve(true);
        }, 1500);
      } else {
        console.warn(`Tab trigger not found for ${tabValue}`);
        resolve(false);
      }
    } catch (error) {
      console.error(`Error activating tab ${tabValue}:`, error);
      resolve(false);
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

    // Helper function to add text
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
        const headerImage = await captureElementAsImage(resultsHeader);
        if (headerImage) {
          pdf.addPage();
          yPosition = addImageToPDF(pdf, headerImage, 20);
        }
      }
    } catch (error) {
      console.error('Error capturing results header:', error);
    }

    // Define tabs to capture
    const tabsToCapture = [
      { value: 'overview', selector: '[data-tab-overview]', title: 'Overview' },
      { value: 'market', selector: '[data-tab-market]', title: 'Market Analysis' },
      { value: 'competition', selector: '[data-tab-competition]', title: 'Competition Analysis' },
      { value: 'financial', selector: '[data-tab-financial]', title: 'Financial Analysis' },
      { value: 'swot', selector: '[data-tab-swot]', title: 'SWOT Analysis' },
      { value: 'scores', selector: '[data-tab-scores]', title: 'Detailed Scores' },
      { value: 'actions', selector: '[data-tab-actions]', title: 'Action Items' }
    ];

    // Process each tab
    for (const tab of tabsToCapture) {
      try {
        console.log(`Processing ${tab.title}...`);
        
        // Activate the tab
        const activated = await activateTab(tab.value);
        if (!activated) {
          console.warn(`Failed to activate ${tab.title} tab`);
          continue;
        }

        // Find and capture the tab content
        const element = document.querySelector(tab.selector) as HTMLElement;
        if (element) {
          console.log(`Capturing ${tab.title} content...`);
          const tabImage = await captureElementAsImage(element);
          
          if (tabImage) {
            pdf.addPage();
            yPosition = 20;
            
            // Add section title
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            yPosition = addText(tab.title, margin, yPosition);
            yPosition += 10;
            
            // Add the captured image
            yPosition = addImageToPDF(pdf, tabImage, yPosition);
            console.log(`Successfully added ${tab.title} to PDF`);
          } else {
            console.warn(`Failed to capture image for ${tab.title}`);
          }
        } else {
          console.warn(`Element not found for ${tab.title}: ${tab.selector}`);
        }
      } catch (error) {
        console.error(`Error processing ${tab.title}:`, error);
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

// Fallback function for text-based PDF
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

    // Title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    yPosition = addText('Business Idea Validation Report', margin, yPosition);
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    yPosition = addText(data.ideaName, margin, yPosition + 10);

    pdf.setFontSize(12);
    yPosition = addText(`Analysis Date: ${data.analysisDate}`, margin, yPosition + 10);
    yPosition = addText(`Overall Score: ${data.score.toFixed(1)}/10`, margin, yPosition + 5);
    yPosition = addText(`Recommendation: ${data.recommendation}`, margin, yPosition + 5);

    // Executive Summary
    pdf.addPage();
    yPosition = 30;
    pdf.setFontSize(14);
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
