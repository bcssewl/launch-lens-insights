
import React from 'react';
import { X, Download, Printer, FileText, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { processMarkdownForPdf, createChatGptPdfHtml } from '@/utils/canvasPdfProcessor';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface CanvasHeaderProps {
  title: string;
  content: string;
  isEditing: boolean;
  onDownload?: () => void;
  onPrint?: () => void;
  onEdit: () => void;
  onClose: () => void;
  onSaveToClient?: () => void;
}

const CanvasHeader: React.FC<CanvasHeaderProps> = ({
  title,
  content,
  isEditing,
  onDownload,
  onPrint,
  onClose,
  onSaveToClient
}) => {
  const { toast } = useToast();

  const handleInstantPrint = async (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('CanvasHeader: Instant print initiated');
    
    try {
      // Process markdown to HTML using existing utility
      const processed = await processMarkdownForPdf(content);
      const html = createChatGptPdfHtml(processed, {
        generatedDate: format(new Date(), 'd MMM yyyy'),
        author: 'AI Assistant'
      });
      
      // Create blob URL
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Create invisible iframe
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '-9999px';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.src = url;
      
      iframe.onload = () => {
        // Set descriptive title for PDF filename
        if (iframe.contentDocument) {
          iframe.contentDocument.title = processed.title.replace(/\s+/g, '_');
        }
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        
        // Cleanup after 60 seconds
        setTimeout(() => {
          URL.revokeObjectURL(url);
          iframe.remove();
        }, 60000);
      };
      
      iframe.onerror = () => {
        console.error('Failed to load print iframe');
        toast({
          title: "Print Failed",
          description: "Unable to open print dialog. Please try again.",
          variant: "destructive"
        });
        URL.revokeObjectURL(url);
        iframe.remove();
      };
      
      document.body.appendChild(iframe);
    } catch (error) {
      console.error('Print failed:', error);
      toast({
        title: "Print Failed",
        description: "Popup blocked – please enable pop-ups for this site to download PDF.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('CanvasHeader: Download clicked');
    onDownload?.();
  };

  const handlePrintClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('CanvasHeader: Print clicked');
    onPrint?.();
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('CanvasHeader: Close button clicked');
    onClose();
  };

  const handleSaveToClientClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('CanvasHeader: Save to Client clicked');
    onSaveToClient?.();
  };

  return (
    <div className="flex items-center justify-between p-4 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <h2 id="canvas-title" className="text-lg font-semibold text-foreground truncate max-w-md">
        {title} {isEditing && <span className="text-sm text-orange-500">(Editing)</span>}
      </h2>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleInstantPrint}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Print to PDF
        </Button>
        {onDownload && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadClick}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        )}
        {onPrint && (
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrintClick}
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        )}
        {onSaveToClient && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveToClientClick}
            className="flex items-center gap-2"
          >
            <FolderOpen className="h-4 w-4" />
            Save to Client
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleCloseClick}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Close
        </Button>
      </div>
    </div>
  );
};

export default CanvasHeader;
