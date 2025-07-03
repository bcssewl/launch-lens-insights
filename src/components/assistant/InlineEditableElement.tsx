
import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface InlineEditableElementProps {
  content: string;
  element: 'h1' | 'h2' | 'h3' | 'p' | 'li';
  onSave: (newContent: string) => void;
  className?: string;
  placeholder?: string;
}

const InlineEditableElement: React.FC<InlineEditableElementProps> = ({
  content,
  element,
  onSave,
  className,
  placeholder = 'Click to edit...'
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const editRef = useRef<HTMLDivElement>(null);

  // Focus the editor when entering edit mode
  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.focus();
      // Select all text
      const range = document.createRange();
      range.selectNodeContents(editRef.current);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditing]);

  const handleClick = () => {
    if (!isEditing) {
      setIsEditing(true);
      setEditContent(content);
    }
  };

  const handleSave = () => {
    const newContent = editRef.current?.textContent || '';
    if (newContent !== content) {
      onSave(newContent);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditContent(content);
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  // Get the appropriate element styles based on type
  const getElementStyles = () => {
    switch (element) {
      case 'h1':
        return 'text-lg font-bold mb-2 mt-1';
      case 'h2':
        return 'text-base font-bold mb-2 mt-1';
      case 'h3':
        return 'text-sm font-bold mb-1 mt-1';
      case 'p':
        return 'mb-2 last:mb-0 leading-relaxed';
      case 'li':
        return 'leading-relaxed';
      default:
        return '';
    }
  };

  const baseStyles = getElementStyles();
  const hoverStyles = !isEditing ? 'hover:bg-accent/20 hover:rounded px-1 -mx-1 cursor-text transition-colors' : '';
  const editingStyles = isEditing ? 'bg-background border border-border rounded px-2 py-1 -mx-2 -my-1' : '';

  const combinedClassName = cn(
    baseStyles,
    hoverStyles,
    editingStyles,
    className
  );

  const ElementTag = element as keyof JSX.IntrinsicElements;

  if (isEditing) {
    return (
      <div
        ref={editRef}
        contentEditable
        suppressContentEditableWarning
        className={combinedClassName}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        style={{ outline: 'none' }}
      >
        {content}
      </div>
    );
  }

  return (
    <ElementTag
      className={combinedClassName}
      onClick={handleClick}
      data-placeholder={!content ? placeholder : undefined}
    >
      {content || placeholder}
    </ElementTag>
  );
};

export default InlineEditableElement;
