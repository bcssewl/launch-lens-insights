
import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Printer, FileText, Edit3, Loader2 } from 'lucide-react';

interface CanvasHeaderProps {
  title: string;
  isEditing: boolean;
  onDownload?: () => void;
  onPrint?: () => void;
  onPdfDownload?: () => void;
  onEdit: () => void;
  onClose: () => void;
  isGeneratingPDF?: boolean;
}

const CanvasHeader: React.FC<CanvasHeaderProps> = ({
  title,
  isEditing,
  onDownload,
  onPrint,
  onPdfDownload,
  onEdit,
  onClose,
  isGeneratingPDF = false
}) => {
  return (
    <div className="bg-background/20 backdrop-blur-sm border-b border-border/20">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-foreground" id="canvas-title">
            {title}
          </h1>
          {isEditing && (
            <span className="text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded">
              Editing
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Download Markdown */}
          {onDownload && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDownload}
              className="text-muted-foreground hover:text-foreground"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          )}

          {/* Enhanced PDF Download */}
          {onPdfDownload && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onPdfDownload}
              disabled={isGeneratingPDF}
              className="text-muted-foreground hover:text-foreground"
            >
              {isGeneratingPDF ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              {isGeneratingPDF ? 'Generating...' : 'PDF'}
            </Button>
          )}

          {/* Browser Print (fallback) */}
          {onPrint && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrint}
              className="text-muted-foreground hover:text-foreground"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          )}

          {/* Edit Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="text-muted-foreground hover:text-foreground"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            {isEditing ? 'View' : 'Edit'}
          </Button>

          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CanvasHeader;
