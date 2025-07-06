import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { generatePDFThumbnail } from '@/components/client-workspace/PDFViewer';

export interface PreviewResult {
  type: 'image' | 'text' | 'error';
  content: string;
  error?: string;
}

export const generatePDFPreview = async (file: File): Promise<PreviewResult> => {
  try {
    console.log('Preview: Starting PDF preview generation');
    console.log(`Preview: File details - name: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);
    
    const startTime = Date.now();
    const thumbnailDataUrl = await generatePDFThumbnail(file);
    const endTime = Date.now();
    
    console.log(`Preview: PDF thumbnail generated successfully in ${endTime - startTime}ms`);
    console.log(`Preview: Thumbnail data URL length: ${thumbnailDataUrl.length}`);
    
    return {
      type: 'image',
      content: thumbnailDataUrl
    };
  } catch (error) {
    console.error('Preview: PDF preview generation failed:', error);
    
    // Return more specific error information
    let errorMessage = 'Failed to generate PDF preview';
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error('Preview: Detailed error info:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    return {
      type: 'error',
      content: '',
      error: errorMessage
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
  console.log('Preview: Getting preview generator for file type:', fileType);
  
  if (fileType.includes('pdf')) {
    console.log('Preview: PDF preview generator selected');
    return generatePDFPreview;
  }
  if (fileType.includes('text') || fileType.includes('json') || fileType.includes('csv')) {
    console.log('Preview: Text preview generator selected');
    return generateTextPreview;
  }
  if (fileType.includes('word') || fileType.includes('document')) {
    console.log('Preview: Word preview generator selected');  
    return generateWordPreview;
  }
  if (fileType.includes('sheet') || fileType.includes('excel')) {
    console.log('Preview: Excel preview generator selected');
    return generateExcelPreview;
  }
  
  console.log('Preview: No preview generator found for file type:', fileType);
  return null;
};
