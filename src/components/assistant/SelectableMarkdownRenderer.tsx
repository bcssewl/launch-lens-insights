
import React, { useRef, useEffect } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import TextSelectionTooltip from './TextSelectionTooltip';
import FollowUpDialog from './FollowUpDialog';
import { useTextSelection } from '@/hooks/useTextSelection';
import { cn } from '@/lib/utils';

interface SelectableMarkdownRendererProps {
  content: string;
  className?: string;
  onSendMessage?: (message: string) => void;
}

const SelectableMarkdownRenderer: React.FC<SelectableMarkdownRendererProps> = ({
  content,
  className,
  onSendMessage
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { selectedText, selectionRect, isVisible, clearSelection } = useTextSelection(containerRef);
  const [showFollowUpDialog, setShowFollowUpDialog] = React.useState(false);

  useEffect(() => {
    console.log('SelectableMarkdownRenderer: Container ref current:', containerRef.current);
    console.log('SelectableMarkdownRenderer: Selection state:', { selectedText, isVisible });
  }, [selectedText, isVisible]);

  const handleFollowUp = () => {
    console.log('SelectableMarkdownRenderer: Follow up clicked');
    setShowFollowUpDialog(true);
  };

  const handleSubmitQuestion = (question: string) => {
    if (onSendMessage) {
      const formattedMessage = `Regarding: "${selectedText}"\n\n${question}`;
      onSendMessage(formattedMessage);
    }
    clearSelection();
  };

  const handleDialogClose = () => {
    setShowFollowUpDialog(false);
    clearSelection();
  };

  return (
    <div 
      ref={containerRef} 
      className={cn("relative", className)}
      style={{ userSelect: 'text' }} // Ensure text is selectable
    >
      <MarkdownRenderer content={content} />
      
      {/* Text Selection Tooltip */}
      {isVisible && selectionRect && (
        <TextSelectionTooltip
          rect={selectionRect}
          onFollowUp={handleFollowUp}
        />
      )}

      {/* Follow-up Dialog */}
      <FollowUpDialog
        isOpen={showFollowUpDialog}
        onClose={handleDialogClose}
        selectedText={selectedText}
        onSubmit={handleSubmitQuestion}
      />
    </div>
  );
};

export default SelectableMarkdownRenderer;
