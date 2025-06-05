
// This file is kept for backward compatibility but the main PDF/print functionality
// has been moved to the PrintView component which uses the browser's native print functionality.
// Users can now print to PDF or physical printer directly from the browser.

export const generateReportPDF = async (data: any) => {
  console.log('PDF generation has been replaced with browser print functionality');
  console.log('Please use the Print/Save as PDF button to access the new print view');
};
