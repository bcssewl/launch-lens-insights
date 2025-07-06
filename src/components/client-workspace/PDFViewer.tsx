import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker to use local bundled version
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

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
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale });
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    await page.render({ canvasContext: context, viewport }).promise;
    return canvas.toDataURL('image/png', 0.8);
  } catch (error) {
    console.error('Error rendering PDF page:', error);
    throw error;
  }
};

export const loadPDFDocument = async (url: string) => {
  try {
    const pdf = await pdfjsLib.getDocument(url).promise;
    return pdf;
  } catch (error) {
    console.error('Error loading PDF document:', error);
    throw error;
  }
};

export const generatePDFThumbnail = async (file: File): Promise<string> => {
  try {
    console.log('Starting PDF thumbnail generation for:', file.name);
    
    const arrayBuffer = await file.arrayBuffer();
    console.log('PDF file size:', arrayBuffer.byteLength, 'bytes');
    
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    console.log('PDF loaded, pages:', pdf.numPages);
    
    const thumbnailDataUrl = await renderPDFPage(pdf, 1, 0.75);
    console.log('PDF thumbnail generated successfully');
    
    return thumbnailDataUrl;
  } catch (error) {
    console.error('PDF thumbnail generation failed:', error);
    throw error;
  }
};
