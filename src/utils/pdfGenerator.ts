
import { ReportData } from './pdf/types';
import { generateSimplePDF } from './pdf/simplePdfGenerator';
import { generateEnhancedReportPDF } from './pdf/enhancedPdfGenerator';

export const generateReportPDF = async (data: ReportData): Promise<void> => {
  try {
    console.log('PDF Generator: Starting report generation for:', data.ideaName);
    
    // Use simple PDF generator as primary method (more reliable)
    await generateSimplePDF(data);
    console.log('PDF Generator: Simple PDF generated successfully');
    
  } catch (error) {
    console.error('PDF Generator: Simple PDF failed, trying enhanced fallback:', error);
    
    try {
      // Fallback to enhanced generator
      await generateEnhancedReportPDF(data);
      console.log('PDF Generator: Enhanced PDF fallback succeeded');
    } catch (enhancedError) {
      console.error('PDF Generator: All methods failed:', enhancedError);
      throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};
