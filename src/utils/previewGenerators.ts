
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

// Configure PDF.js worker - using version that matches our installed pdfjs-dist@5.3.31
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.3.31/build/pdf.worker.min.js`;

export interface PreviewResult {
  type: 'image' | 'text' | 'error';
  content: string;
  error?: string;
}

export const generatePDFPreview = async (file: File): Promise<PreviewResult> => {
  try {
    console.log('Starting PDF preview generation for:', file.name);
    
    const arrayBuffer = await file.arrayBuffer();
    console.log('PDF file size:', arrayBuffer.byteLength, 'bytes');
    
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    console.log('PDF loaded, pages:', pdf.numPages);
    
    const page = await pdf.getPage(1);
    console.log('First page loaded');
    
    const scale = 0.75; // Increased scale for better quality
    const viewport = page.getViewport({ scale });
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    console.log('Canvas created:', canvas.width, 'x', canvas.height);
    
    await page.render({ canvasContext: context, viewport }).promise;
    console.log('PDF page rendered successfully');
    
    const dataUrl = canvas.toDataURL('image/png', 0.8);
    
    return {
      type: 'image',
      content: dataUrl
    };
  } catch (error) {
    console.error('PDF preview generation failed:', error);
    return {
      type: 'error',
      content: '',
      error: `Failed to generate PDF preview: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

export const generateTextPreview = async (file: File): Promise<PreviewResult> => {
  try {
    const text = await file.text();
    const preview = text.substring(0, 200) + (text.length > 200 ? '...' : '');
    
    return {
      type: 'text',
      content: preview
    };
  } catch (error) {
    console.error('Text preview generation failed:', error);
    return {
      type: 'error',
      content: '',
      error: 'Failed to generate text preview'
    };
  }
};

export const generateWordPreview = async (file: File): Promise<PreviewResult> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const preview = result.value.substring(0, 200) + (result.value.length > 200 ? '...' : '');
    
    return {
      type: 'text',
      content: preview
    };
  } catch (error) {
    console.error('Word preview generation failed:', error);
    return {
      type: 'error',
      content: '',
      error: 'Failed to generate Word preview'
    };
  }
};

export const generateExcelPreview = async (file: File): Promise<PreviewResult> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Show first few rows
    const preview = jsonData.slice(0, 5).map(row => 
      (row as any[]).join(' | ')
    ).join('\n');
    
    return {
      type: 'text',
      content: preview + (jsonData.length > 5 ? '\n...' : '')
    };
  } catch (error) {
    console.error('Excel preview generation failed:', error);
    return {
      type: 'error',
      content: '',
      error: 'Failed to generate Excel preview'
    };
  }
};

export const getPreviewGenerator = (fileType: string) => {
  console.log('Getting preview generator for file type:', fileType);
  
  if (fileType.includes('pdf')) {
    console.log('PDF preview generator selected');
    return generatePDFPreview;
  }
  if (fileType.includes('text') || fileType.includes('json') || fileType.includes('csv')) {
    return generateTextPreview;
  }
  if (fileType.includes('word') || fileType.includes('document')) {
    return generateWordPreview;
  }
  if (fileType.includes('sheet') || fileType.includes('excel')) {
    return generateExcelPreview;
  }
  
  console.log('No preview generator found for file type:', fileType);
  return null;
};
