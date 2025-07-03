
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
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Calculate tooltip position using caret position (ChatGPT-like)
  const calculateTooltipPosition = () => {
    const tooltipHeight = showInput ? 48 : 40;
    const tooltipWidth = showInput ? 350 : 120;
    
    // Position tooltip below the caret, centered horizontally on the caret
    let left = rect.left;
    let top = rect.top + 12; // 12px below the caret
    
    // Boundary checks to ensure tooltip stays in viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Horizontal boundary check - adjust if tooltip would be clipped
    if (left + tooltipWidth > viewportWidth - 10) {
      left = viewportWidth - tooltipWidth - 10;
    }
    if (left < 10) {
      left = 10;
    }
    
    // Vertical boundary check - if tooltip would be clipped at bottom, show above
    if (top + tooltipHeight > viewportHeight - 10) {
      top = rect.top - tooltipHeight - 12; // Show above caret
      // If still clipped, clamp to viewport
      if (top < 10) {
        top = 10;
      }
    }
    
    return { top, left };
  };

  const { top, left } = calculateTooltipPosition();

  // Use position: fixed to stay outside scroll containers (like ChatGPT)
  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    left: left,
    top: top,
    zIndex: 1000,
    pointerEvents: 'auto',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none'
  };

  const handleFollowUpClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('TextSelectionTooltip: Follow up button clicked');
    setShowInput(true);
  };

  // Prevent selection collapse when clicking the follow-up button
  const handleFollowUpMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // stops the browser from clearing the selection
    e.stopPropagation();
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

  const handleContainerMouseDown = (e: React.MouseEvent) => {
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
      ref={tooltipRef}
      style={tooltipStyle} 
      className={`animate-fade-in ${showInput ? '' : 'bg-black/90 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg p-2'}`}
      data-selection-tooltip
      onMouseDown={handleContainerMouseDown}
    >
      {!showInput ? (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            onClick={handleFollowUpClick}
            onMouseDown={handleFollowUpMouseDown}
            className="h-8 text-xs bg-white text-black hover:bg-gray-100"
            data-tooltip-trigger
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            Follow up
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleClose}
            className="h-8 w-8 p-0 text-xs text-white hover:bg-white/10"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        <div 
          className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md bg-white/10 border border-white/20 shadow-lg"
          onMouseDown={handleContainerMouseDown}
        >
          <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full">
            <Input
              ref={inputRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about this text..."
              className="h-8 text-sm flex-1 min-w-0 bg-transparent border-none focus:ring-0 focus:outline-none text-white placeholder-white/70"
              onKeyDown={handleKeyDown}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                boxShadow: 'none',
                userSelect: 'text',
                WebkitUserSelect: 'text',
                MozUserSelect: 'text',
                msUserSelect: 'text'
              }}
            />
            <Button
              type="submit"
              disabled={!question.trim()}
              className="h-6 w-6 p-0 bg-white/20 hover:bg-white/30 border-none rounded-full"
            >
              <Send className="w-3 h-3 text-white" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {setShowInput(false); setQuestion('');}}
              className="h-6 w-6 p-0 bg-white/20 hover:bg-white/30 border-none rounded-full"
            >
              <X className="w-3 h-3 text-white" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default TextSelectionTooltip;
