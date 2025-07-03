
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
    console.log('SelectableMarkdownRenderer: Container mounted:', containerRef.current);
    console.log('SelectableMarkdownRenderer: Selection state:', { 
      selectedText: `"${selectedText}"`, 
      isVisible,
      hasRect: !!selectionRect 
    });
  }, [selectedText, isVisible, selectionRect]);

  const handleFollowUp = () => {
    console.log('SelectableMarkdownRenderer: Follow up clicked for text:', selectedText);
    setShowFollowUpDialog(true);
  };

  const handleSubmitQuestion = (question: string) => {
    if (onSendMessage) {
      const formattedMessage = `Regarding: "${selectedText}"\n\n${question}`;
      console.log('SelectableMarkdownRenderer: Sending message:', formattedMessage);
      onSendMessage(formattedMessage);
    }
    clearSelection();
    setShowFollowUpDialog(false);
  };

  const handleDialogClose = () => {
    console.log('SelectableMarkdownRenderer: Dialog closed');
    setShowFollowUpDialog(false);
    clearSelection();
  };

  return (
    <div 
      ref={containerRef} 
      className={cn("relative", className)}
      style={{ 
        userSelect: 'text',
        WebkitUserSelect: 'text',
        MozUserSelect: 'text',
        msUserSelect: 'text'
      }}
    >
      <div style={{ 
        userSelect: 'text',
        WebkitUserSelect: 'text',
        MozUserSelect: 'text',
        msUserSelect: 'text'
      }}>
        <MarkdownRenderer content={content} />
      </div>
      
      {/* Text Selection Tooltip */}
      {isVisible && selectionRect && selectedText && (
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
