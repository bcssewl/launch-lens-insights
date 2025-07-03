
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

interface TextSelectionTooltipProps {
  rect: DOMRect;
  onFollowUp: () => void;
  containerRef?: React.RefObject<HTMLElement>;
}

const TextSelectionTooltip: React.FC<TextSelectionTooltipProps> = ({ rect, onFollowUp, containerRef }) => {
  // Find the closest scrollable container
  const getScrollableContainer = (element: Element | null): Element | null => {
    if (!element || element === document.body) return null;
    
    const computedStyle = window.getComputedStyle(element);
    const overflowY = computedStyle.overflowY;
    const overflowX = computedStyle.overflowX;
    
    if (overflowY === 'auto' || overflowY === 'scroll' || overflowX === 'auto' || overflowX === 'scroll') {
      return element;
    }
    
    return getScrollableContainer(element.parentElement);
  };

  // Calculate tooltip position accounting for scroll offsets
  const calculateTooltipPosition = () => {
    let adjustedTop = rect.bottom + 8;
    let adjustedLeft = rect.left + rect.width / 2;

    // Check if we're inside a scrollable container
    if (containerRef?.current) {
      const scrollableContainer = getScrollableContainer(containerRef.current);
      
      if (scrollableContainer) {
        const containerRect = scrollableContainer.getBoundingClientRect();
        const scrollTop = scrollableContainer.scrollTop;
        const scrollLeft = scrollableContainer.scrollLeft;
        
        // Adjust position to stay within the visible area of the scrollable container
        const relativeTop = rect.bottom - containerRect.top;
        const relativeLeft = rect.left - containerRect.left + rect.width / 2;
        
        // Position tooltip just below the selection, within the container bounds
        adjustedTop = Math.min(
          containerRect.top + relativeTop + 8,
          containerRect.bottom - 60 // Leave space for tooltip
        );
        
        adjustedLeft = Math.max(
          containerRect.left + 60, // Minimum distance from left edge
          Math.min(
            containerRect.left + relativeLeft,
            containerRect.right - 60 // Minimum distance from right edge
          )
        );
      }
    }

    // Final boundary checks against viewport
    adjustedLeft = Math.max(60, Math.min(adjustedLeft, window.innerWidth - 120));
    adjustedTop = Math.min(adjustedTop, window.innerHeight - 60);

    return { top: adjustedTop, left: adjustedLeft };
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
