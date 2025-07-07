import React, { useEffect, useCallback, useState } from 'react';
import { ResizablePanelGroup, ResizableHandle } from '@/components/ui/resizable';
import CanvasHeader from './CanvasHeader';
import CanvasChatPanel from './CanvasChatPanel';
import CanvasReportPanel from './CanvasReportPanel';
import { useCanvasKeyboardShortcuts } from './useCanvasKeyboardShortcuts';
import { FloatingElements } from '@/components/landing/FloatingElements';
import { Message } from '@/constants/aiAssistant';
import { generatePDFFromCanvas } from '@/utils/pdfGenerator';
import { useToast } from '@/hooks/use-toast';

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
  onContentUpdate?: (newContent: string) => void;
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
  onCanvasDownload,
  onCanvasPrint,
  onContentUpdate
}) => {
  const [currentContent, setCurrentContent] = useState(content);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { toast } = useToast();

  console.log('CanvasView: Rendering with isOpen:', isOpen);

  // Update content when prop changes
  useEffect(() => {
    setCurrentContent(content);
  }, [content]);

  // Enhanced PDF download handler
  const handlePdfDownload = useCallback(async () => {
    console.log('CanvasView: Enhanced PDF download initiated');
    setIsGeneratingPDF(true);
    
    try {
      toast({
        title: "Generating PDF",
        description: "Please wait while we create your PDF report..."
      });

      await generatePDFFromCanvas(currentContent, title);
      
      toast({
        title: "PDF Generated",
        description: "Your report has been downloaded successfully"
      });
    } catch (error) {
      console.error('CanvasView: PDF generation failed:', error);
      toast({
        title: "PDF Generation Failed", 
        description: "There was an error generating the PDF. Falling back to browser print.",
        variant: "destructive"
      });
      // Fallback to browser print
      window.print();
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [currentContent, title, toast]);

  // Use keyboard shortcuts hook with enhanced PDF download
  useCanvasKeyboardShortcuts({
    isOpen,
    isEditing: false,
    onClose,
    onPrint: handlePdfDownload,
    onToggleEdit: () => {}
  });

  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      console.log('CanvasView: Backdrop clicked, closing canvas');
      onClose();
    }
  }, [onClose]);

  const handleContentUpdate = useCallback((newContent: string) => {
    console.log('CanvasView: Content updated via seamless editor');
    setCurrentContent(newContent);
    onContentUpdate?.(newContent);
  }, [onContentUpdate]);

  // Format timestamp helper
  const formatTimestamp = useCallback((timestamp: Date): string => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  // Filter messages to exclude canvas previews in full view
  const filteredMessages = React.useMemo(() => {
    return messages.map(msg => {
      // If this is an AI message that contains a report, show only the title
      if (msg.sender === 'ai' && msg.text.includes('# ')) {
        const titleMatch = msg.text.match(/^# (.+)$/m);
        if (titleMatch) {
          return {
            ...msg,
            text: `# ${titleMatch[1]}`,
            isCanvasTitle: true
          };
        }
      }
      return msg;
    });
  }, [messages]);

  // Early return if not open
  if (!isOpen) {
    console.log('CanvasView: Not open, returning null');
    return null;
  }

  console.log('CanvasView: Rendering full canvas view with enhanced PDF generation');

  const hasChat = Boolean(onSendMessage);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="canvas-title"
    >
      <div className="h-full flex flex-col animate-scale-in apple-hero" onClick={(e) => e.stopPropagation()}>
        {/* Floating Elements for consistent background */}
        <FloatingElements />
        
        {/* Header */}
        <CanvasHeader
          title={title}
          isEditing={false}
          onDownload={onDownload}
          onPrint={onPrint}
          onPdfDownload={handlePdfDownload}
          onEdit={() => {}}
          onClose={onClose}
          isGeneratingPDF={isGeneratingPDF}
        />

        {/* Resizable Content Area */}
        <div className="flex-1 bg-background/10 backdrop-blur-sm overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Chat Panel */}
            {hasChat && (
              <>
                <CanvasChatPanel
                  messages={filteredMessages}
                  isTyping={isTyping}
                  viewportRef={viewportRef!}
                  onSendMessage={onSendMessage!}
                  onCanvasDownload={onCanvasDownload}
                  onCanvasPrint={onCanvasPrint}
                  formatTimestamp={formatTimestamp}
                />
                
                <ResizableHandle withHandle />
              </>
            )}

            {/* Report Panel with Seamless Editing */}
            <CanvasReportPanel
              isEditing={false}
              content={currentContent}
              onSave={handleContentUpdate}
              onCancel={() => {}}
              hasChat={hasChat}
              onSendMessage={onSendMessage}
              messageId={canvasState?.messageId}
            />
          </ResizablePanelGroup>
        </div>
      </div>
    </div>
  );
});

CanvasView.displayName = 'CanvasView';

export default CanvasView;
