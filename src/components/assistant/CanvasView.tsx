
import React, { useEffect, useCallback, useState } from 'react';
import { ResizablePanelGroup, ResizableHandle } from '@/components/ui/resizable';
import CanvasHeader from './CanvasHeader';
import CanvasChatPanel from './CanvasChatPanel';
import CanvasReportPanel from './CanvasReportPanel';
import CanvasPrintView from './CanvasPrintView';
import SaveToClientModal from './SaveToClientModal';
import { useCanvasKeyboardShortcuts } from './useCanvasKeyboardShortcuts';
import { FloatingElements } from '@/components/landing/FloatingElements';
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
  selectedModel?: string;
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
  selectedModel = 'best',
  canvasState,
  onCanvasDownload,
  onCanvasPrint,
  onContentUpdate
}) => {
  const [currentContent, setCurrentContent] = useState(content);
  const [showSaveToClientModal, setShowSaveToClientModal] = useState(false);

  console.log('CanvasView: Rendering with isOpen:', isOpen);

  // Update content when prop changes
  useEffect(() => {
    setCurrentContent(content);
  }, [content]);

  // Use keyboard shortcuts hook - Ctrl+P now triggers instant print
  useCanvasKeyboardShortcuts({
    isOpen,
    isEditing: false,
    onClose,
    onPrint: () => {}, // Print handled directly in header now
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

  const handleSaveToClient = useCallback(() => {
    console.log('CanvasView: Save to client clicked');
    setShowSaveToClientModal(true);
  }, []);

  const handleSaveToClientSuccess = useCallback((clientName: string) => {
    console.log('CanvasView: Successfully saved to client:', clientName);
    setShowSaveToClientModal(false);
  }, []);

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

  console.log('CanvasView: Rendering full canvas view with instant print');

  const hasChat = Boolean(onSendMessage);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="canvas-title"
    >
      <div className="h-full flex flex-col animate-scale-in bg-background" onClick={(e) => e.stopPropagation()}>
        
        {/* Header with instant print capability */}
        <CanvasHeader
          title={title}
          content={currentContent}
          isEditing={false}
          onDownload={onDownload}
          onPrint={onPrint}
          onEdit={() => {}}
          onClose={onClose}
          onSaveToClient={handleSaveToClient}
        />

        {/* Resizable Content Area */}
        <div className="flex-1 bg-background overflow-hidden">
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
                  selectedModel={selectedModel}
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

      {/* Save to Client Modal */}
      <SaveToClientModal
        open={showSaveToClientModal}
        onClose={() => setShowSaveToClientModal(false)}
        canvasTitle={title}
        canvasContent={currentContent}
        onSaveSuccess={handleSaveToClientSuccess}
      />
    </div>
  );
});

CanvasView.displayName = 'CanvasView';

export default CanvasView;
