
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, X, Download, Eye, Loader2 } from 'lucide-react';
import { processMarkdownForPdf, createChatGptPdfHtml } from '@/utils/canvasPdfProcessor';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

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
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    const processContent = async () => {
      try {
        // Process the markdown content
        const processed = await processMarkdownForPdf(content);
        setProcessedContent(processed);

        // Create the HTML for PDF generation using ChatGPT styling
        const html = createChatGptPdfHtml(processed, {
          generatedDate: format(new Date(), 'd MMM yyyy'),
          author: 'AI Assistant'
        });
        setPdfHtml(html);
      } catch (error) {
        console.error('Failed to process markdown content:', error);
      }
    };

    processContent();
  }, [content]);

  const handlePrint = () => {
    // Create a new window with the PDF HTML for browser printing
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
    if (!processedContent) return;
    
    setIsGeneratingPdf(true);
    
    try {
      console.log('Generating ChatGPT-style PDF via server...');
      
      // Call the server-side PDF generation function
      const { data, error } = await supabase.functions.invoke('generate-canvas-pdf', {
        body: {
          content,
          title: processedContent.title,
          metadata: {
            generatedDate: format(new Date(), 'd MMM yyyy'),
            author: 'AI Assistant'
          }
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) {
        console.error('PDF generation error:', error);
        throw new Error(error.message || 'Failed to generate PDF');
      }

      // Handle the PDF blob response
      if (data) {
        // Create blob from the response
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const link = document.createElement('a');
        link.href = url;
        link.download = `${processedContent.title.replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the blob URL
        URL.revokeObjectURL(url);
        
        console.log('PDF downloaded successfully');
      }
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      
      // Fallback to browser-based generation
      console.log('Falling back to browser-based PDF generation...');
      const blob = new Blob([pdfHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const pdfWindow = window.open(url, '_blank');
      if (pdfWindow) {
        pdfWindow.onload = () => {
          URL.revokeObjectURL(url);
        };
      }
    } finally {
      setIsGeneratingPdf(false);
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
        <Button 
          onClick={handleDownloadPdf} 
          disabled={isGeneratingPdf}
          className="flex items-center gap-2"
        >
          {isGeneratingPdf ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download PDF
            </>
          )}
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
                  <span className="ml-2 text-gray-600">{format(new Date(), 'd MMM yyyy')}</span>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>ChatGPT-Style PDF Generation:</strong> This PDF will be generated with exact ChatGPT styling, 
                  including Inter font, proper pagination, widow/orphan control, and professional formatting.
                </p>
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
