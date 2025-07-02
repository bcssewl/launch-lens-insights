
import React from 'react';
import { Maximize2, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import MarkdownRenderer from './MarkdownRenderer';
import { ScrollArea } from '@/components/ui/scroll-area';

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
      "mt-3 border rounded-lg bg-background/50 backdrop-blur-sm",
      "max-h-48 overflow-hidden",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-sm font-medium">Report Preview</span>
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

      {/* Scrollable Content Preview - Full Report */}
      <ScrollArea className="h-32">
        <div className="p-3 text-sm">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <MarkdownRenderer content={content} />
          </div>
        </div>
      </ScrollArea>
      
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
