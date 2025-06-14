
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ReportData } from './pdf/types';
import { createComprehensivePDFContent } from './pdf/pdfContentBuilder';
import { waitForFonts } from './pdf/pdfHelpers';

const PDF_CONFIG = {
  scale: 0.8, // Reduced from 1.5 to 0.8
  quality: 0.75, // Optimized JPEG quality
  format: 'JPEG', // Changed from PNG to JPEG
  maxWidth: 794, // A4 width at 96 DPI
  maxHeight: 8000, // Reasonable max height to prevent massive canvases
  pageHeightMM: 297, // A4 height in mm
  pageWidthMM: 210, // A4 width in mm
};

const optimizeCanvasSettings = {
  scale: PDF_CONFIG.scale,
  useCORS: true,
  allowTaint: true,
  backgroundColor: '#ffffff',
  width: PDF_CONFIG.maxWidth,
  logging: false,
  imageTimeout: 10000,
  removeContainer: true,
  // Optimize for smaller file size
  pixelRatio: 1,
  foreignObjectRendering: false,
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
      overflow: hidden;
      word-wrap: break-word;
    `;
    
    document.body.appendChild(content);

    // Wait for fonts and content to settle
    await waitForFonts();
    await new Promise(resolve => setTimeout(resolve, 300)); // Brief settle time

    // Create PDF with optimized metadata
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.setProperties({
      title: `${data.ideaName} - Business Validation Report`,
      subject: 'Business Idea Validation',
      author: 'Launch Lens Insights',
      keywords: 'business validation, market analysis, startup',
      creator: 'Launch Lens Insights',
      compression: true, // Enable PDF compression
    });

    // Generate optimized PDF
    await generateOptimizedPDF(content, pdf);

    // Generate clean filename
    const fileName = `${data.ideaName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_validation_report.pdf`;
    
    // Save with compression
    pdf.save(fileName, { compress: true });

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
