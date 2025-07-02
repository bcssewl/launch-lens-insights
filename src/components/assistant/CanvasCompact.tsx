
import React, { useEffect } from 'react';
import { X, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import MarkdownRenderer from './MarkdownRenderer';

interface CanvasCompactProps {
  isOpen: boolean;
  onClose: () => void;
  onExpand: () => void;
  content: string;
  title?: string;
  reportType?: 'business_analysis' | 'market_research' | 'financial_analysis' | 'general_report';
}

const CanvasCompact: React.FC<CanvasCompactProps> = ({
  isOpen,
  onClose,
  onExpand,
  content,
  title = "Report",
  reportType
}) => {
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getReportTypeIcon = (type?: string) => {
    switch (type) {
      case 'business_analysis': return '📊';
      case 'market_research': return '🎯';
      case 'financial_analysis': return '💰';
      default: return '📋';
    }
  };

  const getReportTypeTitle = (type?: string) => {
    switch (type) {
      case 'business_analysis': return 'Business Analysis';
      case 'market_research': return 'Market Research';
      case 'financial_analysis': return 'Financial Analysis';
      default: return 'Comprehensive Report';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 animate-scale-in">
      <div className="w-96 h-80 bg-background border border-border rounded-lg shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border bg-background/95 rounded-t-lg">
          <h3 className="text-sm font-medium text-foreground truncate flex-1 mr-2">
            {getReportTypeIcon(reportType)} {getReportTypeTitle(reportType)}
          </h3>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onExpand}
              className="h-7 w-7 p-0 hover:bg-muted"
              title="Expand to full screen"
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 w-7 p-0 hover:bg-muted"
              title="Close"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 bg-background">
          <div className="prose prose-sm prose-gray dark:prose-invert max-w-none">
            <MarkdownRenderer 
              content={content} 
              className="compact-canvas-content"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasCompact;
