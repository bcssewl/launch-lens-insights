
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

interface TextSelectionTooltipProps {
  rect: DOMRect;
  onFollowUp: () => void;
}

const TextSelectionTooltip: React.FC<TextSelectionTooltipProps> = ({ rect, onFollowUp }) => {
  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    left: Math.max(8, Math.min(rect.left + rect.width / 2, window.innerWidth - 120)),
    top: Math.min(rect.bottom + 8, window.innerHeight - 60),
    transform: 'translateX(-50%)',
    zIndex: 1000,
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
