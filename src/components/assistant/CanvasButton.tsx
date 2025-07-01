
import React from 'react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CanvasButtonProps {
  onClick: () => void;
  className?: string;
}

const CanvasButton: React.FC<CanvasButtonProps> = ({ onClick, className }) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={`flex items-center gap-2 ${className}`}
    >
      <FileText className="h-4 w-4" />
      View Full Report
    </Button>
  );
};

export default CanvasButton;
