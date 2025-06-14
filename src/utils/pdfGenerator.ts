
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ReportData } from './pdf/types';
import { createComprehensivePDFContent } from './pdf/pdfContentBuilder';
import { waitForFonts } from './pdf/pdfHelpers';

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
