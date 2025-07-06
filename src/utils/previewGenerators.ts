
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
    const thumbnailDataUrl = await generatePDFThumbnail(file);
    
    return {
      type: 'image',
      content: thumbnailDataUrl
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
