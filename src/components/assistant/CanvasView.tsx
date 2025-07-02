
import React, { useEffect, useCallback, useState } from 'react';
import { ResizablePanelGroup, ResizableHandle } from '@/components/ui/resizable';
import CanvasHeader from './CanvasHeader';
import CanvasChatPanel from './CanvasChatPanel';
import CanvasReportPanel from './CanvasReportPanel';
import { useCanvasKeyboardShortcuts } from './useCanvasKeyboardShortcuts';
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
  onCanvasDownload,
  onCanvasPrint,
  onContentUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentContent, setCurrentContent] = useState(content);

  console.log('CanvasView: Rendering with isOpen:', isOpen);

  // Update content when prop changes
  useEffect(() => {
    setCurrentContent(content);
  }, [content]);

  const handleToggleEdit = useCallback(() => {
    setIsEditing(!isEditing);
  }, [isEditing]);

  // Use keyboard shortcuts hook
  useCanvasKeyboardShortcuts({
    isOpen,
    isEditing,
    onClose,
    onPrint,
    onToggleEdit: handleToggleEdit
  });

  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      console.log('CanvasView: Backdrop clicked, closing canvas');
      onClose();
    }
  }, [onClose]);

  const handleSaveEdit = useCallback((newContent: string) => {
    setCurrentContent(newContent);
    setIsEditing(false);
    onContentUpdate?.(newContent);
    console.log('CanvasView: Content updated');
  }, [onContentUpdate]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
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

  console.log('CanvasView: Rendering full canvas view');

  const hasChat = Boolean(onSendMessage);

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
        <CanvasHeader
          title={title}
          isEditing={isEditing}
          onDownload={onDownload}
          onPrint={onPrint}
          onEdit={() => setIsEditing(true)}
          onClose={onClose}
        />

        {/* Resizable Content Area */}
        <div className="flex-1 bg-background/95 backdrop-blur-sm overflow-hidden">
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

            {/* Report Panel */}
            <CanvasReportPanel
              isEditing={isEditing}
              content={currentContent}
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
              hasChat={hasChat}
            />
          </ResizablePanelGroup>
        </div>
      </div>
    </div>
  );
});

CanvasView.displayName = 'CanvasView';

export default CanvasView;
