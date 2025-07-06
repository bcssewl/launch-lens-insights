
// Simplified PDF viewer that uses direct Supabase URLs
// No more complex client-side PDF processing

export interface PDFDisplayProps {
  url: string;
  title?: string;
  className?: string;
}

export const SimplePDFDisplay: React.FC<PDFDisplayProps> = ({ 
  url, 
  title = 'PDF Document',
  className = '' 
}) => {
  return (
    <iframe
      src={url}
      title={title}
      className={`w-full h-full border-0 ${className}`}
      style={{ minHeight: '600px' }}
    />
  );
};

// Legacy functions maintained for backward compatibility but simplified
export const generatePDFThumbnail = async (file: File): Promise<string> => {
  console.log('PDF.js: Legacy thumbnail generation called - redirecting to direct URL approach');
  throw new Error('Use direct Supabase URL for PDF preview instead of client-side processing');
};

export const loadPDFDocument = async (url: string) => {
  console.log('PDF.js: Legacy PDF loading called - use direct URL instead');
  throw new Error('Use direct Supabase URL for PDF preview instead of client-side processing');
};

export const renderPDFPage = async (pdf: any, pageNumber: number, scale: number = 1.5): Promise<string> => {
  console.log('PDF.js: Legacy PDF rendering called - use direct URL instead');
  throw new Error('Use direct Supabase URL for PDF preview instead of client-side processing');
};

// Default export for the simple PDF display component
export default SimplePDFDisplay;
