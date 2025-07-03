
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

interface TextSelectionTooltipProps {
  rect: DOMRect;
  onFollowUp: () => void;
  containerRef?: React.RefObject<HTMLElement>;
}

const TextSelectionTooltip: React.FC<TextSelectionTooltipProps> = ({ rect, onFollowUp }) => {
  // Calculate tooltip position above the caret
  const calculateTooltipPosition = () => {
    const tooltipHeight = 40; // Approximate height of the tooltip
    const tooltipWidth = 120; // Approximate width of the tooltip
    
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

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('TextSelectionTooltip: Follow up button clicked');
    onFollowUp();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div 
      style={tooltipStyle} 
      className="animate-fade-in"
      data-selection-tooltip
      onMouseDown={handleMouseDown}
    >
      <Button
        size="sm"
        onClick={handleClick}
        className="bg-background/95 backdrop-blur-sm border border-border hover:bg-background text-foreground shadow-lg"
        data-tooltip-trigger
      >
        <MessageSquare className="w-3 h-3 mr-1" />
        Follow up
      </Button>
    </div>
  );
};

export default TextSelectionTooltip;
