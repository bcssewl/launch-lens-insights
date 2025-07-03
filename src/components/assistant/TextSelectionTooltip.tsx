
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
    left: rect.left + rect.width / 2,
    top: rect.bottom + 8,
    transform: 'translateX(-50%)',
    zIndex: 1000,
  };

  return (
    <div style={tooltipStyle} className="animate-fade-in">
      <Button
        size="sm"
        onClick={onFollowUp}
        className="bg-background/95 backdrop-blur-sm border border-border hover:bg-background text-foreground shadow-lg"
      >
        <MessageSquare className="w-3 h-3 mr-1" />
        Follow up
      </Button>
    </div>
  );
};

export default TextSelectionTooltip;
