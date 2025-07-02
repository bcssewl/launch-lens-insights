
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Save, X, Edit } from 'lucide-react';

interface CanvasEditorProps {
  content: string;
  onSave: (newContent: string) => void;
  onCancel: () => void;
  className?: string;
}

const CanvasEditor: React.FC<CanvasEditorProps> = ({
  content,
  onSave,
  onCancel,
  className
}) => {
  const [editedContent, setEditedContent] = useState(content);
  const [hasChanges, setHasChanges] = useState(false);

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setEditedContent(newContent);
    setHasChanges(newContent !== content);
  }, [content]);

  const handleSave = useCallback(() => {
    onSave(editedContent);
    setHasChanges(false);
  }, [editedContent, onSave]);

  const handleCancel = useCallback(() => {
    setEditedContent(content);
    setHasChanges(false);
    onCancel();
  }, [content, onCancel]);

  return (
    <div className={`h-full flex flex-col ${className}`}>
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Edit className="h-4 w-4" />
          <span className="text-sm font-medium">Editing Report</span>
          {hasChanges && (
            <span className="text-xs text-orange-500">• Unsaved changes</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>
      
      <div className="flex-1 p-4">
        <Textarea
          value={editedContent}
          onChange={handleContentChange}
          className="w-full h-full resize-none font-mono text-sm leading-relaxed"
          placeholder="Edit your report content in Markdown format..."
          autoExpand={false}
        />
      </div>
    </div>
  );
};

export default CanvasEditor;
