
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
    <div className={cn("canvas-compact mt-3", className)}>
      {/* Header */}
      <div className="canvas-header">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>Report Preview</span>
        </div>
        <div className="flex items-center gap-1 ml-auto">
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
      <div className="canvas-body">
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
      
      <style jsx>{`
        .canvas-compact {
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--surface-2);
          box-shadow: 0 2px 6px rgba(0,0,0,0.08);
          padding: 0;
          width: 100%;
          max-width: 600px;
          height: 280px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .canvas-header {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          background: var(--surface-3);
          border-bottom: 1px solid var(--border);
          font-weight: 600;
          font-size: 0.9rem;
        }

        .canvas-body {
          flex-grow: 1;
          overflow-y: auto;
          padding: 8px 12px;
        }
      `}</style>
    </div>
  );
};

export default CanvasCompact;
