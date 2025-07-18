import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CanvasButtonProps {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

const CanvasButton: React.FC<CanvasButtonProps> = ({ 
  onClick, 
  className,
  disabled = false 
}) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-8 w-8 p-0 hover:bg-white/20 transition-colors duration-200",
        className
      )}
      title="Convert to Canvas"
    >
      <FileText className="h-4 w-4" />
    </Button>
  );
};

export default CanvasButton;