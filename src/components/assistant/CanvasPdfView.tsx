
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, X, Download, Eye } from 'lucide-react';
import { processMarkdownForPdf, createPdfHtml } from '@/utils/canvasPdfProcessor';
import { format } from 'date-fns';

interface CanvasPdfViewProps {
  content: string;
  title: string;
  onClose: () => void;
}

const CanvasPdfView: React.FC<CanvasPdfViewProps> = ({
  content,
  title,
  onClose
}) => {
  const [processedContent, setProcessedContent] = useState<any>(null);
  const [pdfHtml, setPdfHtml] = useState<string>('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    // Process the markdown content
    const processed = processMarkdownForPdf(content);
    setProcessedContent(processed);

    // Create the HTML for PDF generation
    const html = createPdfHtml(processed, {
      generatedDate: format(new Date(), 'MMM d, yyyy'),
      author: 'AI Assistant'
    });
    setPdfHtml(html);
  }, [content]);

  const handlePrint = () => {
    // Create a new window with the PDF HTML
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(pdfHtml);
      printWindow.document.close();
      
      // Wait for content to load, then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };
    }
  };

  const handleDownloadPdf = async () => {
    try {
      // Create a blob with the HTML content
      const blob = new Blob([pdfHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // For now, open in new window so user can manually save as PDF
      // In production, you'd send this to a server-side PDF generator
      const pdfWindow = window.open(url, '_blank');
      if (pdfWindow) {
        pdfWindow.onload = () => {
          // Clean up the blob URL
          URL.revokeObjectURL(url);
        };
      }
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    }
  };

  const togglePreview = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  if (!processedContent) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-center text-gray-600">Processing document...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
      {/* Controls */}
      <div className="fixed top-4 right-4 z-60 flex gap-2">
        <Button onClick={togglePreview} variant="outline" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          {isPreviewMode ? 'Edit View' : 'Print Preview'}
        </Button>
        <Button onClick={handleDownloadPdf} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
        <Button onClick={handlePrint} className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          Print
        </Button>
        <Button variant="outline" onClick={onClose} className="flex items-center gap-2">
          <X className="h-4 w-4" />
          Close
        </Button>
      </div>

      {/* Content */}
      <div className="h-full overflow-auto">
        {isPreviewMode ? (
          // Print preview - show exactly how it will look when printed
          <div className="bg-white">
            <iframe
              srcDoc={pdfHtml}
              className="w-full h-full border-0"
              title="PDF Preview"
            />
          </div>
        ) : (
          // Regular preview with document info
          <div className="max-w-4xl mx-auto p-8 bg-white min-h-full">
            {/* Document Info */}
            <div className="mb-8 p-6 bg-gray-50 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Document Information</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Title:</span>
                  <span className="ml-2 text-gray-600">{processedContent.title}</span>
                </div>
                <div>
                  <span className="font-medium">Word Count:</span>
                  <span className="ml-2 text-gray-600">{processedContent.wordCount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium">Estimated Pages:</span>
                  <span className="ml-2 text-gray-600">{processedContent.estimatedPages}</span>
                </div>
                <div>
                  <span className="font-medium">Generated:</span>
                  <span className="ml-2 text-gray-600">{format(new Date(), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>

            {/* Content Preview */}
            <div className="prose prose-gray max-w-none">
              <div dangerouslySetInnerHTML={{ __html: processedContent.html }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CanvasPdfView;
