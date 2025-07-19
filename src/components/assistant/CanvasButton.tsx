import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CanvasButtonProps {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  variant?: 'default' | 'active';
}

const CanvasButton: React.FC<CanvasButtonProps> = ({ 
  onClick, 
  className,
  disabled = false,
  variant = 'default'
}) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-8 w-8 p-0 transition-colors duration-200",
        variant === 'active' 
          ? "bg-primary/20 hover:bg-primary/30 text-primary" 
          : "hover:bg-white/20",
        className
      )}
      title={variant === 'active' ? "Exit Canvas Preview" : "Convert to Canvas Preview"}
    >
      <FileText className="h-4 w-4" />
    </Button>
  );
};

export default CanvasButton;