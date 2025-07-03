
import React, { useMemo } from 'react';
import { ResizablePanel } from '@/components/ui/resizable';
import InlineMarkdownEditor from './InlineMarkdownEditor';

interface CanvasReportPanelProps {
  isEditing: boolean;
  content: string;
  onSave: (newContent: string) => void;
  onCancel: () => void;
  hasChat: boolean;
  onSendMessage?: (message: string) => void;
}

const CanvasReportPanel: React.FC<CanvasReportPanelProps> = ({
  content,
  onSave,
  hasChat,
  onSendMessage
}) => {
  // Memoize canvas styles to prevent recalculation
  const canvasStyles = useMemo(() => ({
    fontSize: '16px',
    lineHeight: '1.7',
  }), []);

  const handleContentChange = (newContent: string) => {
    onSave(newContent);
  };

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
            <InlineMarkdownEditor
              content={content}
              onContentChange={handleContentChange}
              onSendMessage={onSendMessage}
              className="canvas-content"
            />
          </div>
        </div>
      </div>
    </ResizablePanel>
  );
};

export default CanvasReportPanel;
