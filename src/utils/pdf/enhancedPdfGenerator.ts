
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ReportData } from './types';
import { createProfessionalCoverPage, createEnhancedTableOfContents, createProfessionalExecutiveSummary } from './enhancedContentGenerators';
import { createProfessionalStyles } from './professionalStyles';
import { waitForFonts } from './pdfHelpers';

const PDF_CONFIG = {
  scale: 2.0, // Higher scale for better quality
  quality: 1.0,
  format: 'PNG',
  maxWidth: 794,
  pageHeightMM: 297,
  pageWidthMM: 210,
  margins: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  }
};

const createProfessionalDocument = (data: ReportData): HTMLElement => {
  const container = document.createElement('div');
  container.className = 'professional-report-container';
  
  // Apply professional styles
  const styleElement = document.createElement('style');
  styleElement.textContent = createProfessionalStyles();
  document.head.appendChild(styleElement);
  
  // Create document structure with enhanced sections
  const sections = [
    createProfessionalCoverPage(data),
    createEnhancedTableOfContents(),
    createProfessionalExecutiveSummary(data)
    // Additional sections will be added in future iterations
  ];
  
  sections.forEach((section, index) => {
    if (index > 0) {
      section.classList.add('page-break');
    }
    container.appendChild(section);
  });
  
  return container;
};

const generateOptimizedPDF = async (content: HTMLElement, pdf: jsPDF): Promise<void> => {
  console.log('Enhanced PDF: Starting generation with professional styling');
  
  // Apply styles for PDF generation
  content.style.cssText = `
    width: ${PDF_CONFIG.maxWidth}px;
    background: #ffffff;
    color: #000000;
    position: static;
    visibility: visible;
    overflow: visible;
    margin: 0;
    padding: 0;
  `;
  
  // Enhanced canvas settings for better quality
  const canvasOptions = {
    scale: PDF_CONFIG.scale,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    width: PDF_CONFIG.maxWidth,
    logging: false,
    imageTimeout: 20000,
    removeContainer: true,
    pixelRatio: window.devicePixelRatio || 1,
    foreignObjectRendering: true,
    onclone: (clonedDoc: Document) => {
      // Ensure all fonts are loaded in cloned document
      const style = clonedDoc.createElement('style');
      style.textContent = createProfessionalStyles();
      clonedDoc.head.appendChild(style);
      
      // Optimize all elements for PDF rendering
      const allElements = clonedDoc.getElementsByTagName('*');
      for (let i = 0; i < allElements.length; i++) {
        const element = allElements[i] as HTMLElement;
        element.style.visibility = 'visible';
        element.style.display = element.style.display || 'block';
        
        // Ensure text is properly colored
        if (!element.style.color || element.style.color === 'transparent') {
          element.style.color = '#1e293b';
        }
      }
    }
  };
  
  // Wait for fonts and layout to settle
  await waitForFonts();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate high-quality canvas
  const canvas = await html2canvas(content, canvasOptions);
  
  console.log(`Enhanced PDF: Canvas generated - ${canvas.width}x${canvas.height}`);
  
  // Calculate pages
  const pageHeightPx = (PDF_CONFIG.pageHeightMM / PDF_CONFIG.pageWidthMM) * canvas.width;
  const totalPages = Math.ceil(canvas.height / pageHeightPx);
  
  console.log(`Enhanced PDF: Generating ${totalPages} pages`);
  
  // Generate pages with optimized quality
  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    if (pageIndex > 0) {
      pdf.addPage();
    }
    
    const sourceY = pageIndex * pageHeightPx;
    const sourceHeight = Math.min(pageHeightPx, canvas.height - sourceY);
    
    if (sourceHeight <= 0) break;
    
    // Create high-quality page canvas
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvas.width;
    pageCanvas.height = sourceHeight;
    
    const pageCtx = pageCanvas.getContext('2d', { alpha: false });
    if (pageCtx) {
      // Set high-quality rendering
      pageCtx.imageSmoothingEnabled = true;
      pageCtx.imageSmoothingQuality = 'high';
      
      // White background
      pageCtx.fillStyle = '#ffffff';
      pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      
      // Draw content with high quality
      pageCtx.drawImage(
        canvas,
        0, sourceY, canvas.width, sourceHeight,
        0, 0, canvas.width, sourceHeight
      );
      
      // Convert to high-quality image
      const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
      
      // Add to PDF with optimized dimensions
      const imgWidth = PDF_CONFIG.pageWidthMM - (PDF_CONFIG.margins.left + PDF_CONFIG.margins.right);
      const imgHeight = (sourceHeight / canvas.width) * imgWidth;
      
      pdf.addImage(
        pageImgData,
        'PNG',
        PDF_CONFIG.margins.left,
        PDF_CONFIG.margins.top,
        imgWidth,
        imgHeight,
        undefined,
        'FAST'
      );
      
      console.log(`Enhanced PDF: Page ${pageIndex + 1} added with high quality`);
    }
  }
};

export const generateEnhancedReportPDF = async (data: ReportData): Promise<void> => {
  let content: HTMLElement | null = null;
  
  try {
    console.log('Enhanced PDF: Starting professional report generation');
    
    // Create professional document
    content = createProfessionalDocument(data);
    
    // Add to document for rendering
    content.style.position = 'absolute';
    content.style.left = '-9999px';
    content.style.top = '0';
    document.body.appendChild(content);
    
    console.log('Enhanced PDF: Professional content created and staged');
    
    // Wait for content to render properly
    await waitForFonts();
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Create PDF with metadata
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.setProperties({
      title: `${data.ideaName} - Professional Validation Report`,
      subject: 'Business Idea Validation Analysis',
      author: 'Launch Lens Insights',
      creator: 'Launch Lens Professional Analysis Platform',
      keywords: 'business validation, market analysis, startup report'
    });
    
    // Generate enhanced PDF
    await generateOptimizedPDF(content, pdf);
    
    // Save with professional filename
    const fileName = `${data.ideaName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_professional_report.pdf`;
    pdf.save(fileName);
    
    console.log('Enhanced PDF: Professional report generated successfully');
    
  } catch (error) {
    console.error('Enhanced PDF: Generation failed:', error);
    throw new Error(`Failed to generate professional PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    if (content && content.parentNode) {
      content.parentNode.removeChild(content);
      console.log('Enhanced PDF: Cleanup completed');
    }
  }
};
