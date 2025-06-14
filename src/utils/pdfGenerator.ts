
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ReportData } from './pdf/types';
import { createComprehensivePDFContent } from './pdf/pdfContentBuilder';
import { waitForFonts } from './pdf/pdfHelpers';

const PDF_CONFIG = {
  scale: 1.5,
  quality: 1.0,
  format: 'PNG',
  maxWidth: 794,
  maxHeight: 16000,
  pageHeightMM: 297,
  pageWidthMM: 210,
};

const optimizeCanvasSettings = {
  scale: PDF_CONFIG.scale,
  useCORS: true,
  allowTaint: true,
  backgroundColor: '#ffffff',
  width: PDF_CONFIG.maxWidth,
  logging: true,
  imageTimeout: 15000,
  removeContainer: true,
  pixelRatio: 1,
  foreignObjectRendering: false,
  onclone: (clonedDoc: Document) => {
    console.log('PDF: Cloning document for capture');
    
    // Make all content visible by removing hidden styles
    const hiddenElements = clonedDoc.querySelectorAll('[style*="visibility: hidden"], [style*="display: none"]');
    hiddenElements.forEach((element: Element) => {
      const htmlElement = element as HTMLElement;
      htmlElement.style.visibility = 'visible';
      htmlElement.style.display = 'block';
    });
    
    // Ensure all text is visible with proper contrast
    const allElements = clonedDoc.getElementsByTagName('*');
    for (let i = 0; i < allElements.length; i++) {
      const element = allElements[i] as HTMLElement;
      
      // Set default text color if not specified
      if (!element.style.color || element.style.color === 'transparent') {
        element.style.color = '#000000';
      }
      
      // Ensure backgrounds are properly set
      if (element.tagName === 'BODY' || element.tagName === 'HTML') {
        element.style.backgroundColor = '#ffffff';
      }
    }
    
    // Fix SVG elements
    const svgs = clonedDoc.getElementsByTagName('svg');
    for (let i = 0; i < svgs.length; i++) {
      const svg = svgs[i] as SVGElement;
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svg.style.backgroundColor = 'transparent';
    }
    
    console.log('PDF: Document cloning completed');
  }
};

const generateOptimizedPDF = async (content: HTMLElement, pdf: jsPDF): Promise<void> => {
  console.log('PDF: Starting generation with content dimensions:', {
    width: content.offsetWidth,
    height: content.offsetHeight,
    scrollHeight: content.scrollHeight
  });
  
  // Make content visible for capture
  content.style.visibility = 'visible';
  content.style.position = 'static';
  content.style.left = 'auto';
  content.style.top = 'auto';
  content.style.backgroundColor = '#ffffff';
  content.style.color = '#000000';
  
  // Force a layout recalculation
  content.offsetHeight;
  
  console.log('PDF: Content prepared for capture');
  
  // Generate canvas with optimized settings
  const canvas = await html2canvas(content, optimizeCanvasSettings);

  console.log(`PDF: Canvas generated - ${canvas.width}x${canvas.height}`);
  
  // Verify canvas has content
  const ctx = canvas.getContext('2d');
  const imageData = ctx?.getImageData(0, 0, Math.min(100, canvas.width), Math.min(100, canvas.height));
  const hasContent = imageData?.data.some((value, index) => {
    // Check if any pixel is not white (255,255,255) or transparent
    if (index % 4 === 3) return false; // Skip alpha channel
    return value < 255;
  });
  
  console.log('PDF: Canvas content check:', hasContent ? 'Content detected' : 'No content detected');
  
  // Calculate page handling
  const pageHeightPx = (PDF_CONFIG.pageHeightMM / PDF_CONFIG.pageWidthMM) * canvas.width;
  const totalPages = Math.ceil(canvas.height / pageHeightPx);
  
  console.log(`PDF: Will generate ${totalPages} pages`);

  // Process pages
  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    if (pageIndex > 0) {
      pdf.addPage();
    }
    
    const sourceY = pageIndex * pageHeightPx;
    const sourceHeight = Math.min(pageHeightPx, canvas.height - sourceY);
    
    if (sourceHeight <= 0) break;
    
    console.log(`PDF: Processing page ${pageIndex + 1}/${totalPages}`);
    
    // Create page canvas
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvas.width;
    pageCanvas.height = sourceHeight;
    
    const pageCtx = pageCanvas.getContext('2d', { alpha: false });
    if (pageCtx) {
      // White background
      pageCtx.fillStyle = '#ffffff';
      pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      
      // Draw content
      pageCtx.drawImage(
        canvas, 
        0, sourceY, canvas.width, sourceHeight,
        0, 0, canvas.width, sourceHeight
      );
      
      // Convert to image
      const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
      
      // Add to PDF
      pdf.addImage(
        pageImgData, 
        'PNG', 
        0, 0, 
        PDF_CONFIG.pageWidthMM, 
        (sourceHeight / canvas.width) * PDF_CONFIG.pageWidthMM,
        undefined,
        'FAST'
      );
      
      console.log(`PDF: Page ${pageIndex + 1} added successfully`);
    }
  }
  
  console.log('PDF: Generation completed successfully');
};

export const generateReportPDF = async (data: ReportData): Promise<void> => {
  let content: HTMLElement | null = null;
  
  try {
    console.log('PDF: Starting report generation');

    // Create content
    content = createComprehensivePDFContent(data);
    
    // Apply proper styling for PDF generation
    content.style.cssText = `
      width: ${PDF_CONFIG.maxWidth}px;
      min-height: 1000px;
      background: #ffffff;
      color: #000000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 20px;
      margin: 0;
      position: static;
      visibility: hidden;
      overflow: visible;
    `;
    
    document.body.appendChild(content);
    console.log('PDF: Content appended to document');

    // Wait for content to settle
    await waitForFonts();
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.setProperties({
      title: `${data.ideaName} - Business Validation Report`,
      subject: 'Business Idea Validation',
      author: 'Launch Lens Insights',
      creator: 'Launch Lens Insights',
    });

    // Generate PDF
    await generateOptimizedPDF(content, pdf);

    // Save
    const fileName = `${data.ideaName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_validation_report.pdf`;
    pdf.save(fileName);

    console.log('PDF: Report saved successfully as', fileName);

  } catch (error) {
    console.error('PDF: Generation failed:', error);
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    if (content && content.parentNode) {
      content.parentNode.removeChild(content);
      console.log('PDF: Cleanup completed');
    }
  }
};
