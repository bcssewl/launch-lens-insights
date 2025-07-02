
import React from 'react';
import { Maximize2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import MarkdownRenderer from './MarkdownRenderer';

interface CanvasCompactProps {
  content: string;
  title?: string;
  onExpand: () => void;
  onClose: () => void;
  className?: string;
}

const CanvasCompact: React.FC<CanvasCompactProps> = ({
  content,
  title = "Report",
  onExpand,
  onClose,
  className
}) => {
  return (
    <div className={cn("canvas-compact", className)}>
      <div className="canvas-header">
        <span className="flex-1 truncate">{title}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onExpand}
          className="h-6 w-6 p-0 hover:bg-muted"
        >
          <Maximize2 className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0 hover:bg-muted"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      <div className="canvas-body">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <MarkdownRenderer content={content} />
        </div>
      </div>
    </div>
  );
};

export default CanvasCompact;
