
import React, { useRef, useEffect } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import TextSelectionTooltip from './TextSelectionTooltip';
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

  useEffect(() => {
    console.log('SelectableMarkdownRenderer: Container mounted:', containerRef.current);
    console.log('SelectableMarkdownRenderer: Selection state:', { 
      selectedText: `"${selectedText}"`, 
      isVisible,
      hasRect: !!selectionRect
    });
  }, [selectedText, isVisible, selectionRect]);

  const handleFollowUp = (question: string) => {
    if (onSendMessage && selectedText) {
      const formattedMessage = `Regarding: "${selectedText}"\n\n${question}`;
      console.log('SelectableMarkdownRenderer: Sending message:', formattedMessage);
      onSendMessage(formattedMessage);
    }
    clearSelection();
  };

  const handleClose = () => {
    console.log('SelectableMarkdownRenderer: Tooltip closed, clearing selection');
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
      {isVisible && selectionRect && selectedText && onSendMessage && (
        <TextSelectionTooltip
          rect={selectionRect}
          onFollowUp={handleFollowUp}
          onClose={handleClose}
          containerRef={containerRef}
        />
      )}
    </div>
  );
};

export default SelectableMarkdownRenderer;
