
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker with local-first strategy and detailed logging
const configureWorker = async () => {
  console.log('PDF.js: Starting worker configuration...');
  
  // Try local worker first
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    console.log('PDF.js: Local worker configured successfully');
    
    // Test if worker actually works by attempting to load a simple PDF
    const testArrayBuffer = new ArrayBuffer(8);
    try {
      await pdfjsLib.getDocument({ data: testArrayBuffer }).promise;
      console.log('PDF.js: Local worker test successful');
      return;
    } catch (testError) {
      console.warn('PDF.js: Local worker test failed:', testError);
      throw new Error('Local worker not functional');
    }
  } catch (error) {
    console.warn('PDF.js: Local worker setup failed:', error);
  }

  // Fallback to CDN - try jsdelivr first
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
    console.log('PDF.js: Using jsdelivr CDN worker as fallback');
    
    // Test jsdelivr worker
    const testArrayBuffer = new ArrayBuffer(8);
    try {
      await pdfjsLib.getDocument({ data: testArrayBuffer }).promise;
      console.log('PDF.js: jsdelivr CDN worker test successful');
      return;
    } catch (testError) {
      console.warn('PDF.js: jsdelivr CDN worker test failed:', testError);
      throw new Error('jsdelivr CDN worker not functional');
    }
  } catch (error) {
    console.warn('PDF.js: jsdelivr CDN worker failed:', error);
  }

  // Final fallback to unpkg
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
    console.log('PDF.js: Using unpkg CDN worker as final fallback');
  } catch (error) {
    console.error('PDF.js: All worker configuration attempts failed:', error);
    throw new Error('PDF.js worker configuration completely failed');
  }
};

// Initialize worker configuration with error handling
configureWorker().catch(error => {
  console.error('PDF.js: Worker configuration failed:', error);
});

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
    console.log(`PDF.js: Starting to render page ${pageNumber} at scale ${scale}`);
    
    const page = await pdf.getPage(pageNumber);
    console.log(`PDF.js: Successfully got page ${pageNumber} object`);
    
    const viewport = page.getViewport({ scale });
    console.log(`PDF.js: Viewport created - width: ${viewport.width}, height: ${viewport.height}`);
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('Failed to get 2D canvas context');
    }
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    console.log(`PDF.js: Canvas created - ${canvas.width}x${canvas.height}`);
    
    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    
    console.log(`PDF.js: Starting render task for page ${pageNumber}`);
    const renderTask = page.render(renderContext);
    
    await renderTask.promise;
    console.log(`PDF.js: Render task completed for page ${pageNumber}`);
    
    const dataUrl = canvas.toDataURL('image/png', 0.8);
    console.log(`PDF.js: Data URL generated for page ${pageNumber}, length: ${dataUrl.length}`);
    
    return dataUrl;
  } catch (error) {
    console.error(`PDF.js: Error rendering page ${pageNumber}:`, error);
    throw new Error(`Failed to render PDF page ${pageNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const loadPDFDocument = async (url: string) => {
  try {
    console.log('PDF.js: Starting to load PDF document from:', url);
    
    const loadingTask = pdfjsLib.getDocument({
      url: url,
      cMapUrl: '/cmaps/',
      cMapPacked: true,
      verbosity: 1 // Enable some PDF.js internal logging
    });
    
    console.log('PDF.js: Loading task created, waiting for promise...');
    
    loadingTask.onProgress = (progress: any) => {
      console.log(`PDF.js: Loading progress - ${progress.loaded}/${progress.total} bytes (${Math.round(progress.loaded/progress.total*100)}%)`);
    };
    
    const pdf = await loadingTask.promise;
    console.log('PDF.js: PDF document loaded successfully');
    console.log(`PDF.js: Document info - pages: ${pdf.numPages}, fingerprints: ${pdf.fingerprints}`);
    
    return pdf;
  } catch (error) {
    console.error('PDF.js: Error loading PDF document:', error);
    console.error('PDF.js: Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    if (error instanceof Error && error.message.includes('worker')) {
      throw new Error('PDF worker failed to load. This might be due to network restrictions or CORS issues.');
    }
    throw new Error(`Failed to load PDF document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const generatePDFThumbnail = async (file: File): Promise<string> => {
  try {
    console.log('PDF.js: Starting PDF thumbnail generation');
    console.log(`PDF.js: File details - name: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
    
    // Check file size and warn for very large files
    if (file.size > 10 * 1024 * 1024) { // 10MB
      console.warn(`PDF.js: Large PDF file detected: ${file.size} bytes - this may take longer to process`);
    }
    
    console.log('PDF.js: Reading file as array buffer...');
    const arrayBuffer = await file.arrayBuffer();
    console.log(`PDF.js: Array buffer created, size: ${arrayBuffer.byteLength} bytes`);
    
    console.log('PDF.js: Creating PDF document from array buffer...');
    const pdf = await pdfjsLib.getDocument({ 
      data: arrayBuffer,
      cMapUrl: '/cmaps/',
      cMapPacked: true,
      verbosity: 1
    }).promise;
    
    console.log(`PDF.js: PDF document created from file, pages: ${pdf.numPages}`);
    
    console.log('PDF.js: Generating thumbnail from first page...');
    const thumbnailDataUrl = await renderPDFPage(pdf, 1, 0.75);
    console.log('PDF.js: Thumbnail generated successfully');
    
    return thumbnailDataUrl;
  } catch (error) {
    console.error('PDF.js: PDF thumbnail generation failed:', error);
    console.error('PDF.js: Thumbnail error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
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
