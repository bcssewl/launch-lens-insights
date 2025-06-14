import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ReportData } from './pdf/types';
import { createComprehensivePDFContent } from './pdf/pdfContentBuilder';
import { waitForFonts } from './pdf/pdfHelpers';

const PDF_CONFIG = {
  scale: 1.2, // Increased from 0.8 to 1.2 for better quality
  quality: 0.95, // Increased quality
  format: 'JPEG',
  maxWidth: 794,
  maxHeight: 16000, // Doubled from 8000 to allow more content
  pageHeightMM: 297,
  pageWidthMM: 210,
};

const optimizeCanvasSettings = {
  scale: PDF_CONFIG.scale,
  useCORS: true,
  allowTaint: true,
  backgroundColor: '#ffffff',
  width: PDF_CONFIG.maxWidth,
  logging: true, // Enable logging for debugging
  imageTimeout: 15000, // Increased timeout
  removeContainer: true,
  pixelRatio: 2, // Increased for better quality
  foreignObjectRendering: true, // Enable for better rendering
};

const generateOptimizedPDF = async (content: HTMLElement, pdf: jsPDF): Promise<void> => {
  console.log('Generating optimized PDF with improved settings...');
  
  // Measure actual content height and apply reasonable limits
  const actualHeight = Math.min(content.scrollHeight, PDF_CONFIG.maxHeight);
  
  // Generate canvas with optimized settings
  const canvas = await html2canvas(content, {
    ...optimizeCanvasSettings,
    height: actualHeight,
  });

  console.log(`Canvas dimensions: ${canvas.width}x${canvas.height}`);
  
  // Calculate optimal page handling
  const pageHeightPx = (PDF_CONFIG.pageHeightMM / 210) * canvas.width; // Maintain aspect ratio
  const totalPages = Math.ceil(canvas.height / pageHeightPx);
  
  console.log(`Total pages to generate: ${totalPages}`);

  // Process pages more efficiently
  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    if (pageIndex > 0) {
      pdf.addPage();
    }
    
    // Calculate source coordinates for this page
    const sourceY = pageIndex * pageHeightPx;
    const sourceHeight = Math.min(pageHeightPx, canvas.height - sourceY);
    
    if (sourceHeight <= 0) break; // Skip empty pages
    
    // Create optimized page canvas
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvas.width;
    pageCanvas.height = sourceHeight;
    
    const pageCtx = pageCanvas.getContext('2d');
    if (pageCtx) {
      // Optimize canvas context settings
      pageCtx.imageSmoothingEnabled = true;
      pageCtx.imageSmoothingQuality = 'medium';
      
      // Draw the page content
      pageCtx.drawImage(
        canvas, 
        0, sourceY, canvas.width, sourceHeight,
        0, 0, canvas.width, sourceHeight
      );
      
      // Convert to optimized JPEG
      const pageImgData = pageCanvas.toDataURL(`image/${PDF_CONFIG.format.toLowerCase()}`, PDF_CONFIG.quality);
      
      // Add to PDF with proper scaling
      pdf.addImage(
        pageImgData, 
        PDF_CONFIG.format, 
        0, 0, 
        PDF_CONFIG.pageWidthMM, 
        (sourceHeight / canvas.width) * PDF_CONFIG.pageWidthMM
      );
      
      // Clean up page canvas immediately
      pageCanvas.width = 0;
      pageCanvas.height = 0;
    }
    
    // Force garbage collection hint
    if (pageIndex % 3 === 0 && typeof window !== 'undefined' && window.gc) {
      window.gc();
    }
  }
  
  // Clean up main canvas
  canvas.width = 0;
  canvas.height = 0;
  
  console.log('PDF generation completed with optimized settings');
};

export const generateReportPDF = async (data: ReportData): Promise<void> => {
  let content: HTMLElement | null = null;
  
  try {
    console.log('Starting optimized PDF generation with data:', data);

    // Create the comprehensive PDF content
    content = createComprehensivePDFContent(data);
    
    // Apply size optimizations to content
    content.style.cssText += `
      max-width: ${PDF_CONFIG.maxWidth}px;
      overflow: visible;
      word-wrap: break-word;
      position: absolute;
      left: -9999px;
      top: 0;
    `;
    
    document.body.appendChild(content);

    // Wait for fonts and content to settle
    await waitForFonts();
    // Increased settle time to ensure all content is rendered
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create PDF with optimized metadata
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.setProperties({
      title: `${data.ideaName} - Business Validation Report`,
      subject: 'Business Idea Validation',
      author: 'Launch Lens Insights',
      keywords: 'business validation, market analysis, startup',
      creator: 'Launch Lens Insights',
    });

    // Generate optimized PDF
    await generateOptimizedPDF(content, pdf);

    // Generate clean filename
    const fileName = `${data.ideaName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_validation_report.pdf`;
    
    // Save PDF
    pdf.save(fileName);

    console.log('Optimized PDF generated successfully:', fileName);

  } catch (error) {
    console.error('Error generating optimized PDF:', error);
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    // Comprehensive cleanup
    if (content && content.parentNode) {
      content.parentNode.removeChild(content);
    }
    
    // Force cleanup
    if (typeof window !== 'undefined') {
      // Trigger garbage collection if available
      if (window.gc) {
        window.gc();
      }
      
      // Clear any cached images
      const images = document.querySelectorAll('img[src^="data:"]');
      images.forEach(img => {
        if (img instanceof HTMLImageElement) {
          img.src = '';
        }
      });
    }
  }
};
