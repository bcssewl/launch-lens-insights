
import React from 'react';
import { Maximize2, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import MarkdownRenderer from './MarkdownRenderer';

interface CanvasCompactProps {
  content: string;
  onExpand: () => void;
  onDownload?: () => void;
  onPrint?: () => void;
  className?: string;
}

const CanvasCompact: React.FC<CanvasCompactProps> = ({
  content,
  onExpand,
  onDownload,
  onPrint,
  className
}) => {
  return (
    <div className={cn(
      "mt-3 border rounded-lg bg-background/95 backdrop-blur-sm shadow-md",
      "w-full max-w-[600px] h-[280px] overflow-hidden flex flex-col",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1 bg-muted/50 border-b border-border text-sm font-semibold">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>Report Preview</span>
        </div>
        <div className="flex items-center gap-1">
          {onDownload && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDownload}
              className="h-7 w-7 p-0"
            >
              <Download className="h-3 w-3" />
            </Button>
          )}
          {onPrint && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrint}
              className="h-7 w-7 p-0"
            >
              <Printer className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onExpand}
            className="h-7 w-7 p-0"
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div className="prose prose-sm max-w-none text-muted-foreground">
          <MarkdownRenderer content={content} />
        </div>
      </div>
      
      {/* Footer with expand button */}
      <div className="p-2 border-t bg-muted/10 flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={onExpand}
          className="text-xs"
        >
          View Full Report
        </Button>
      </div>
    </div>
  );
};

export default CanvasCompact;
