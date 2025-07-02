
import React, { useMemo } from 'react';
import { ResizablePanel } from '@/components/ui/resizable';
import MarkdownRenderer from './MarkdownRenderer';
import CanvasEditor from './CanvasEditor';

interface CanvasReportPanelProps {
  isEditing: boolean;
  content: string;
  onSave: (newContent: string) => void;
  onCancel: () => void;
  hasChat: boolean;
}

const CanvasReportPanel: React.FC<CanvasReportPanelProps> = ({
  isEditing,
  content,
  onSave,
  onCancel,
  hasChat
}) => {
  // Memoize canvas styles to prevent recalculation
  const canvasStyles = useMemo(() => ({
    fontSize: '16px',
    lineHeight: '1.7',
  }), []);

  return (
    <ResizablePanel defaultSize={hasChat ? 60 : 100}>
      {isEditing ? (
        <CanvasEditor
          content={content}
          onSave={onSave}
          onCancel={onCancel}
          className="h-full"
        />
      ) : (
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
      )}
    </ResizablePanel>
  );
};

export default CanvasReportPanel;
