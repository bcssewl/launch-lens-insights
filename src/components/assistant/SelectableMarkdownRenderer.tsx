
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
  const [preservedText, setPreservedText] = React.useState('');

  useEffect(() => {
    console.log('SelectableMarkdownRenderer: Container mounted:', containerRef.current);
    console.log('SelectableMarkdownRenderer: Selection state:', { 
      selectedText: `"${selectedText}"`, 
      isVisible,
      hasRect: !!selectionRect,
      preservedText: `"${preservedText}"`
    });
  }, [selectedText, isVisible, selectionRect, preservedText]);

  const handleFollowUp = () => {
    console.log('SelectableMarkdownRenderer: Follow up clicked for text:', selectedText);
    setPreservedText(selectedText);
    setShowFollowUpDialog(true);
    console.log('SelectableMarkdownRenderer: Preserved text set to:', selectedText);
  };

  const handleSubmitQuestion = (question: string) => {
    if (onSendMessage && preservedText) {
      const formattedMessage = `Regarding: "${preservedText}"\n\n${question}`;
      console.log('SelectableMarkdownRenderer: Sending message:', formattedMessage);
      onSendMessage(formattedMessage);
    }
    handleDialogClose();
  };

  const handleDialogClose = () => {
    console.log('SelectableMarkdownRenderer: Dialog closed, clearing all selections');
    setShowFollowUpDialog(false);
    setPreservedText('');
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
      {isVisible && selectionRect && selectedText && !showFollowUpDialog && (
        <TextSelectionTooltip
          rect={selectionRect}
          onFollowUp={handleFollowUp}
          containerRef={containerRef}
        />
      )}

      {/* Follow-up Dialog */}
      <FollowUpDialog
        isOpen={showFollowUpDialog}
        onClose={handleDialogClose}
        selectedText={preservedText}
        onSubmit={handleSubmitQuestion}
      />
    </div>
  );
};

export default SelectableMarkdownRenderer;
