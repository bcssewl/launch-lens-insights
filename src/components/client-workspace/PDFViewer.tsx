
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker with local-first strategy and CDN fallback
const configureWorker = async () => {
  // Try local worker first
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    console.log('PDF.js: Using local worker');
    return;
  } catch (error) {
    console.warn('PDF.js: Local worker failed, trying CDN fallback:', error);
  }

  // Fallback to CDN
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
    console.log('PDF.js: Using CDN worker as fallback');
  } catch (error) {
    console.error('PDF.js: Both local and CDN workers failed:', error);
    throw new Error('PDF.js worker configuration failed');
  }
};

// Initialize worker configuration
configureWorker().catch(console.error);

export interface PDFRenderOptions {
  scale?: number;
  pageNumber?: number;
}

export const renderPDFPage = async (
  pdf: any, 
  pageNumber: number, 
  scale: number = 1.5
): Promise<string> => {
  try {
    console.log(`Rendering PDF page ${pageNumber} at scale ${scale}`);
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale });
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    await page.render({ canvasContext: context, viewport }).promise;
    const dataUrl = canvas.toDataURL('image/png', 0.8);
    console.log(`PDF page ${pageNumber} rendered successfully`);
    return dataUrl;
  } catch (error) {
    console.error('Error rendering PDF page:', error);
    throw new Error(`Failed to render PDF page ${pageNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const loadPDFDocument = async (url: string) => {
  try {
    console.log('Loading PDF document from:', url);
    const pdf = await pdfjsLib.getDocument(url).promise;
    console.log('PDF document loaded successfully, pages:', pdf.numPages);
    return pdf;
  } catch (error) {
    console.error('Error loading PDF document:', error);
    if (error instanceof Error && error.message.includes('worker')) {
      throw new Error('PDF worker failed to load. This might be due to network restrictions or CORS issues.');
    }
    throw new Error(`Failed to load PDF document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const generatePDFThumbnail = async (file: File): Promise<string> => {
  try {
    console.log('Starting PDF thumbnail generation for:', file.name, 'size:', file.size, 'bytes');
    
    // Check file size and warn for very large files
    if (file.size > 10 * 1024 * 1024) { // 10MB
      console.warn('Large PDF file detected:', file.size, 'bytes - this may take longer to process');
    }
    
    const arrayBuffer = await file.arrayBuffer();
    console.log('PDF file loaded into memory');
    
    const pdf = await pdfjsLib.getDocument({ 
      data: arrayBuffer,
      cMapUrl: '/cmaps/',
      cMapPacked: true
    }).promise;
    console.log('PDF loaded, pages:', pdf.numPages);
    
    const thumbnailDataUrl = await renderPDFPage(pdf, 1, 0.75);
    console.log('PDF thumbnail generated successfully');
    
    return thumbnailDataUrl;
  } catch (error) {
    console.error('PDF thumbnail generation failed:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('worker')) {
        throw new Error('PDF worker initialization failed. Please refresh the page and try again.');
      } else if (error.message.includes('Invalid PDF')) {
        throw new Error('Invalid or corrupted PDF file.');
      } else if (error.message.includes('fetch')) {
        throw new Error('Network error while processing PDF. Please check your connection.');
      }
    }
    
    throw new Error(`PDF thumbnail generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
