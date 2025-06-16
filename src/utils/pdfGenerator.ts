
import { ReportData } from './pdf/types';
import { generateEnhancedReportPDF } from './pdf/enhancedPdfGenerator';

export const generateReportPDF = async (data: ReportData): Promise<void> => {
  try {
    console.log('PDF Generator: Starting enhanced report generation');
    await generateEnhancedReportPDF(data);
    console.log('PDF Generator: Enhanced report completed successfully');
  } catch (error) {
    console.error('PDF Generator: Failed to generate enhanced PDF:', error);
    
    // Fallback to basic generation if enhanced fails
    console.log('PDF Generator: Attempting fallback generation');
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
