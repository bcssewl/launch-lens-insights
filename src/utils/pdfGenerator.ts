
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFGenerationOptions {
  filename?: string;
  format?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
  margin?: number;
  quality?: number;
}

export const generatePDFFromElement = async (
  element: HTMLElement,
  options: PDFGenerationOptions = {}
): Promise<void> => {
  const {
    filename = `report-${new Date().toISOString().split('T')[0]}.pdf`,
    format = 'a4',
    orientation = 'portrait',
    margin = 20,
    quality = 1
  } = options;

  try {
    console.log('PDF Generator: Starting PDF generation');
    
    // Get element dimensions
    const elementRect = element.getBoundingClientRect();
    console.log('PDF Generator: Element dimensions:', elementRect);

    // Create canvas from element with higher quality
    const canvas = await html2canvas(element, {
      scale: quality,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (clonedDoc) => {
        // Fix styles in cloned document for better rendering
        const clonedElement = clonedDoc.getElementById(element.id) || clonedDoc.querySelector('[data-pdf-content]');
        if (clonedElement) {
          clonedElement.style.position = 'static';
          clonedElement.style.transform = 'none';
          clonedElement.style.width = 'auto';
          clonedElement.style.height = 'auto';
        }
      }
    });

    console.log('PDF Generator: Canvas created, size:', canvas.width, 'x', canvas.height);

    // Calculate PDF dimensions
    const imgWidth = format === 'a4' ? 210 : 216; // A4 or Letter width in mm
    const pageHeight = format === 'a4' ? 297 : 279; // A4 or Letter height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Create PDF
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format
    });

    // Calculate available space considering margins
    const availableWidth = imgWidth - (margin * 2);
    const availableHeight = pageHeight - (margin * 2);
    
    let heightLeft = imgHeight;
    let position = 0;
    let pageCount = 1;

    // Add first page
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', margin, margin, availableWidth, Math.min(imgHeight, availableHeight), undefined, 'FAST');
    heightLeft -= availableHeight;

    // Add additional pages if content overflows
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pageCount++;
      console.log('PDF Generator: Adding page', pageCount);
      
      pdf.addImage(imgData, 'PNG', margin, position + margin, availableWidth, imgHeight, undefined, 'FAST');
      heightLeft -= availableHeight;
    }

    console.log('PDF Generator: Generated', pageCount, 'pages');

    // Add page numbers if multiple pages
    if (pageCount > 1) {
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setTextColor(128, 128, 128);
        pdf.text(
          `Page ${i} of ${totalPages}`,
          imgWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }
    }

    // Save the PDF
    pdf.save(filename);
    console.log('PDF Generator: PDF saved successfully');

  } catch (error) {
    console.error('PDF Generator: Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};

export const generatePDFFromCanvas = async (canvasContent: string, title: string = 'AI Report'): Promise<void> => {
  // Create a temporary container for rendering
  const tempContainer = document.createElement('div');
  tempContainer.id = 'pdf-temp-container';
  tempContainer.setAttribute('data-pdf-content', 'true');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.top = '0';
  tempContainer.style.width = '210mm'; // A4 width
  tempContainer.style.backgroundColor = '#ffffff';
  tempContainer.style.padding = '20mm';
  tempContainer.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  tempContainer.style.fontSize = '14px';
  tempContainer.style.lineHeight = '1.6';
  tempContainer.style.color = '#000000';

  // Convert markdown to HTML (basic conversion)
  const htmlContent = canvasContent
    .replace(/^# (.+)$/gm, '<h1 style="font-size: 24px; font-weight: bold; margin: 20px 0 16px 0; color: #1a1a1a;">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size: 20px; font-weight: bold; margin: 16px 0 12px 0; color: #2a2a2a;">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 style="font-size: 18px; font-weight: bold; margin: 12px 0 8px 0; color: #3a3a3a;">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li style="margin: 4px 0;">$1</li>')
    .replace(/(<li.*<\/li>)/gs, '<ul style="margin: 8px 0; padding-left: 20px;">$1</ul>')
    .replace(/\n\n/g, '</p><p style="margin: 12px 0;">')
    .replace(/^\n/, '<p style="margin: 12px 0;">')
    .replace(/\n$/, '</p>');

  tempContainer.innerHTML = htmlContent;
  document.body.appendChild(tempContainer);

  try {
    await generatePDFFromElement(tempContainer, {
      filename: `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`,
      quality: 2
    });
  } finally {
    // Clean up
    document.body.removeChild(tempContainer);
  }
};
