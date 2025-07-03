
import React, { useMemo } from 'react';
import { ResizablePanel } from '@/components/ui/resizable';
import SeamlessMarkdownEditor from './SeamlessMarkdownEditor';
import { useCanvasDocument } from '@/hooks/useCanvasDocument';

interface CanvasReportPanelProps {
  isEditing: boolean;
  content: string;
  onSave: (newContent: string) => void;
  onCancel: () => void;
  hasChat: boolean;
  onSendMessage?: (message: string) => void;
  messageId?: string;
}

const CanvasReportPanel: React.FC<CanvasReportPanelProps> = ({
  content,
  onSave,
  hasChat,
  onSendMessage,
  messageId
}) => {
  const { document } = useCanvasDocument(messageId, content);

  // Memoize canvas styles to prevent recalculation
  const canvasStyles = useMemo(() => ({
    fontSize: '16px',
    lineHeight: '1.7',
  }), []);

  const handleContentChange = (newContent: string) => {
    onSave(newContent);
  };

  // Extract title from content
  const title = useMemo(() => {
    const firstLine = content.split('\n')[0];
    return firstLine.replace(/^#\s*/, '') || 'AI Report';
  }, [content]);

  return (
    <ResizablePanel defaultSize={hasChat ? 60 : 100}>
      <div className="h-full overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          <div 
            style={{ 
              ...canvasStyles,
              userSelect: 'text',
              WebkitUserSelect: 'text',
              MozUserSelect: 'text',
              msUserSelect: 'text'
            }}
          >
            <SeamlessMarkdownEditor
              content={content}
              onContentChange={handleContentChange}
              onSendMessage={onSendMessage}
              documentId={document?.id}
              title={title}
              className="canvas-content"
            />
          </div>
        </div>
      </div>
    </ResizablePanel>
  );
};

export default CanvasReportPanel;
