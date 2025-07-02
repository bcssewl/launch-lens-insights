
import React, { useEffect, useCallback, useMemo } from 'react';
import { X, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { cn } from '@/lib/utils';
import MarkdownRenderer from './MarkdownRenderer';
import ChatArea from './ChatArea';
import { Message } from '@/constants/aiAssistant';

interface CanvasViewProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  title?: string;
  onDownload?: () => void;
  onPrint?: () => void;
  messages?: Message[];
  isTyping?: boolean;
  viewportRef?: React.RefObject<HTMLDivElement>;
  onSendMessage?: (message: string) => void;
  canvasState?: {
    isOpen: boolean;
    messageId: string | null;
    content: string;
  };
  onOpenCanvas?: (messageId: string, content: string) => void;
  onCloseCanvas?: () => void;
  onCanvasDownload?: () => void;
  onCanvasPrint?: () => void;
}

const CanvasView: React.FC<CanvasViewProps> = React.memo(({
  isOpen,
  onClose,
  content,
  title = "Report",
  onDownload,
  onPrint,
  messages = [],
  isTyping = false,
  viewportRef,
  onSendMessage,
  canvasState,
  onOpenCanvas,
  onCloseCanvas,
  onCanvasDownload,
  onCanvasPrint
}) => {
  console.log('CanvasView: Rendering with isOpen:', isOpen);

  // Memoize handlers to prevent unnecessary re-renders
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      console.log('CanvasView: Escape key pressed, closing canvas');
      onClose();
    } else if (event.ctrlKey && event.key === 'p') {
      event.preventDefault();
      onPrint?.();
    }
  }, [onClose, onPrint]);

  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      console.log('CanvasView: Backdrop clicked, closing canvas');
      onClose();
    }
  }, [onClose]);

  const handleDownloadClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('CanvasView: Download clicked');
    onDownload?.();
  }, [onDownload]);

  const handlePrintClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('CanvasView: Print clicked');
    onPrint?.();
  }, [onPrint]);

  const handleCloseClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('CanvasView: Close button clicked');
    onClose();
  }, [onClose]);

  // Memoize canvas styles to prevent recalculation
  const canvasStyles = useMemo(() => ({
    fontSize: '16px',
    lineHeight: '1.7',
  }), []);

  // Handle keyboard shortcuts and body overflow
  useEffect(() => {
    if (!isOpen) {
      console.log('CanvasView: Not open, skipping effect');
      return;
    }

    console.log('CanvasView: Setting up keyboard listeners and body overflow');
    
    const handleKeyDownWrapper = (event: KeyboardEvent) => {
      handleKeyDown(event);
    };

    document.addEventListener('keydown', handleKeyDownWrapper);
    document.body.style.overflow = 'hidden';

    return () => {
      console.log('CanvasView: Cleaning up keyboard listeners and body overflow');
      document.removeEventListener('keydown', handleKeyDownWrapper);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  // Early return if not open
  if (!isOpen) {
    console.log('CanvasView: Not open, returning null');
    return null;
  }

  console.log('CanvasView: Rendering full canvas view');

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="canvas-title"
    >
      <div className="h-full flex flex-col animate-scale-in" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-background/95 backdrop-blur-sm border-b border-border/50">
          <h2 id="canvas-title" className="text-lg font-semibold text-foreground truncate max-w-md">
            {title}
          </h2>
          <div className="flex items-center gap-2">
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

        {/* Resizable Content Area */}
        <div className="flex-1 bg-background/95 backdrop-blur-sm overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Chat Panel */}
            {onSendMessage && (
              <>
                <ResizablePanel defaultSize={40} minSize={30} maxSize={60}>
                  <div className="h-full border-r border-border/50 overflow-hidden">
                    <ChatArea
                      messages={messages}
                      isTyping={isTyping}
                      viewportRef={viewportRef}
                      onSendMessage={onSendMessage}
                      onOpenCanvas={onOpenCanvas}
                      onCloseCanvas={onCloseCanvas}
                      onCanvasDownload={onCanvasDownload}
                      onCanvasPrint={onCanvasPrint}
                    />
                  </div>
                </ResizablePanel>
                
                <ResizableHandle withHandle />
              </>
            )}

            {/* Report Panel */}
            <ResizablePanel defaultSize={onSendMessage ? 60 : 100}>
              <div className="h-full overflow-auto">
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
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </div>
  );
});

CanvasView.displayName = 'CanvasView';

export default CanvasView;
