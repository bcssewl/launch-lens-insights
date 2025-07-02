
import React, { useEffect } from 'react';
import { X, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import MarkdownRenderer from './MarkdownRenderer';

interface CanvasViewProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  title?: string;
  onDownload?: () => void;
  onPrint?: () => void;
}

const CanvasView: React.FC<CanvasViewProps> = ({
  isOpen,
  onClose,
  content,
  title = "Report",
  onDownload,
  onPrint
}) => {
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.ctrlKey && event.key === 'p') {
        event.preventDefault();
        onPrint?.();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, onPrint]);

  if (!isOpen) return null;

  const canvasStyles = {
    fontSize: '16px',
    lineHeight: '1.7',
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="h-full flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-background/95 backdrop-blur-sm border-b border-border/50">
          <h2 className="text-lg font-semibold text-foreground truncate max-w-md">
            {title}
          </h2>
          <div className="flex items-center gap-2">
            {onDownload && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDownload}
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
                onClick={onPrint}
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                Print
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Close
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-background/95 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto p-8">
            <div 
              className="prose prose-gray dark:prose-invert max-w-none"
              style={canvasStyles}
            >
              <MarkdownRenderer 
                content={content} 
                className="canvas-content"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasView;
