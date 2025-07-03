
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, X } from 'lucide-react';

interface TextSelectionTooltipProps {
  rect: DOMRect;
  onFollowUp: (question: string) => void;
  onClose: () => void;
  containerRef?: React.RefObject<HTMLElement>;
}

const TextSelectionTooltip: React.FC<TextSelectionTooltipProps> = ({ 
  rect, 
  onFollowUp, 
  onClose 
}) => {
  const [showInput, setShowInput] = useState(false);
  const [question, setQuestion] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Calculate tooltip position above the caret
  const calculateTooltipPosition = () => {
    const tooltipHeight = showInput ? 80 : 40; // Taller when showing input
    const tooltipWidth = showInput ? 320 : 120; // Wider when showing input
    
    // Position tooltip above the caret, centered horizontally on the caret
    let left = rect.left + rect.width / 2;
    let top = rect.top - tooltipHeight - 8; // 8px gap above
    
    // Boundary checks to ensure tooltip stays in viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Horizontal boundary check
    if (left - tooltipWidth / 2 < 10) {
      left = tooltipWidth / 2 + 10; // Minimum 10px from left edge
    } else if (left + tooltipWidth / 2 > viewportWidth - 10) {
      left = viewportWidth - tooltipWidth / 2 - 10; // Minimum 10px from right edge
    }
    
    // Vertical boundary check - if tooltip would go above viewport, show below instead
    if (top < 10) {
      top = rect.bottom + 8; // Show below with 8px gap
    }
    
    return { top, left };
  };

  const { top, left } = calculateTooltipPosition();

  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    left: left,
    top: top,
    transform: 'translateX(-50%)',
    zIndex: 1000,
    pointerEvents: 'auto'
  };

  const handleFollowUpClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('TextSelectionTooltip: Follow up button clicked');
    setShowInput(true);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (question.trim()) {
      console.log('TextSelectionTooltip: Submitting question:', question);
      onFollowUp(question.trim());
      setQuestion('');
      setShowInput(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setShowInput(false);
      setQuestion('');
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Focus input when it appears
  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showInput]);

  return (
    <div 
      style={tooltipStyle} 
      className="animate-fade-in bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-2"
      data-selection-tooltip
      onMouseDown={handleMouseDown}
    >
      {!showInput ? (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            onClick={handleFollowUpClick}
            className="h-8 text-xs"
            data-tooltip-trigger
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            Follow up
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleClose}
            className="h-8 w-8 p-0 text-xs"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full">
          <Input
            ref={inputRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about this text..."
            className="h-8 text-xs flex-1 min-w-0"
            onKeyDown={handleKeyDown}
          />
          <Button
            type="submit"
            size="sm"
            disabled={!question.trim()}
            className="h-8 w-8 p-0"
          >
            <Send className="w-3 h-3" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {setShowInput(false); setQuestion('');}}
            className="h-8 w-8 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        </form>
      )}
    </div>
  );
};

export default TextSelectionTooltip;
