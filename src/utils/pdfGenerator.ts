
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
    
    // Ensure element is visible and has dimensions
    if (element.offsetWidth === 0 || element.offsetHeight === 0) {
      console.warn('Element has no dimensions, trying to make it visible');
      return null;
    }

    // Wait for any animations to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    const canvas = await html2canvas(element, {
      scale: 1.5,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      height: element.scrollHeight,
      width: element.scrollWidth,
      onclone: (clonedDoc) => {
        // Ensure all styles are properly applied in the clone
        const clonedElement = clonedDoc.querySelector(`[data-tab-content]`);
        if (clonedElement) {
          (clonedElement as HTMLElement).style.display = 'block';
          (clonedElement as HTMLElement).style.visibility = 'visible';
        }
      }
    });
    
    console.log('Canvas created with dimensions:', canvas.width, 'x', canvas.height);
    return canvas.toDataURL('image/png', 0.9);
  } catch (error) {
    console.error('Error capturing element:', error);
    return null;
  }
};

const addImageToPDF = (pdf: jsPDF, imageData: string, yPosition: number, title?: string): number => {
  try {
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 10;
    
    // Add section title if provided
    if (title) {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = margin;
      }
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, margin, yPosition);
      yPosition += 15;
    }
    
    // Create image to get dimensions
    const img = new Image();
    img.src = imageData;
    
    // Calculate image dimensions to fit page
    const maxWidth = pageWidth - 2 * margin;
    const maxHeight = pageHeight - yPosition - margin;
    
    let imgWidth = img.width * 0.2; // Scale down significantly for PDF
    let imgHeight = img.height * 0.2;
    
    // Ensure image fits within page bounds
    if (imgWidth > maxWidth) {
      const scale = maxWidth / imgWidth;
      imgWidth = maxWidth;
      imgHeight = imgHeight * scale;
    }
    
    if (imgHeight > maxHeight) {
      const scale = maxHeight / imgHeight;
      imgHeight = maxHeight;
      imgWidth = imgWidth * scale;
    }
    
    // Check if we need a new page
    if (yPosition + imgHeight > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
      
      // Re-add title on new page
      if (title) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, margin, yPosition);
        yPosition += 15;
      }
    }
    
    // Add image to PDF
    pdf.addImage(imageData, 'PNG', margin, yPosition, imgWidth, imgHeight);
    console.log(`Added image to PDF at position ${yPosition} with dimensions ${imgWidth}x${imgHeight}`);
    
    return yPosition + imgHeight + 10;
  } catch (error) {
    console.error('Error adding image to PDF:', error);
    return yPosition + 20;
  }
};

const makeAllTabsVisible = () => {
  // Find all tab content divs and make them visible
  const tabContents = [
    '[data-tab-overview]',
    '[data-tab-market]', 
    '[data-tab-competition]',
    '[data-tab-financial]',
    '[data-tab-swot]',
    '[data-tab-scores]',
    '[data-tab-actions]'
  ];

  const originalStyles: Array<{ element: HTMLElement; display: string; visibility: string }> = [];

  tabContents.forEach(selector => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      // Store original styles
      originalStyles.push({
        element,
        display: element.style.display,
        visibility: element.style.visibility
      });
      
      // Make visible
      element.style.display = 'block';
      element.style.visibility = 'visible';
      element.style.opacity = '1';
    }
  });

  return () => {
    // Restore original styles
    originalStyles.forEach(({ element, display, visibility }) => {
      element.style.display = display;
      element.style.visibility = visibility;
    });
  };
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
          yPosition = addImageToPDF(pdf, headerImage, 20, 'Report Summary');
        }
      }
    } catch (error) {
      console.error('Error capturing results header:', error);
    }

    // Make all tabs visible temporarily
    const restoreTabVisibility = makeAllTabsVisible();
    
    // Wait for DOM updates
    await new Promise(resolve => setTimeout(resolve, 500));

    // Define tabs to capture with their data attributes
    const tabsToCapture = [
      { selector: '[data-tab-overview]', title: 'Executive Overview' },
      { selector: '[data-tab-market]', title: 'Market Analysis' },
      { selector: '[data-tab-competition]', title: 'Competition Analysis' },
      { selector: '[data-tab-financial]', title: 'Financial Analysis' },
      { selector: '[data-tab-swot]', title: 'SWOT Analysis' },
      { selector: '[data-tab-scores]', title: 'Detailed Scores' },
      { selector: '[data-tab-actions]', title: 'Recommended Actions' }
    ];

    // Process each tab
    for (const tab of tabsToCapture) {
      try {
        console.log(`Processing ${tab.title}...`);
        
        const element = document.querySelector(tab.selector) as HTMLElement;
        if (element) {
          console.log(`Capturing ${tab.title} content...`);
          const tabImage = await captureElementAsImage(element);
          
          if (tabImage) {
            pdf.addPage();
            yPosition = addImageToPDF(pdf, tabImage, 20, tab.title);
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

    // Restore original tab visibility
    restoreTabVisibility();

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
