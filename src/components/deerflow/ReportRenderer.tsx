import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Share2, Edit, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import MarkdownRenderer from '@/components/assistant/MarkdownRenderer';
import { toast } from 'sonner';

interface ReportRendererProps {
  content: string;
  title?: string;
  isComplete?: boolean;
  isStreaming?: boolean;
  onDownload?: (format: 'pdf' | 'markdown' | 'word') => void;
  onShare?: () => void;
  onEdit?: () => void;
  className?: string;
}

export const ReportRenderer: React.FC<ReportRendererProps> = ({
  content,
  title = "Research Report",
  isComplete = false,
  isStreaming = false,
  onDownload,
  onShare,
  onEdit,
  className
}) => {
  const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'markdown' | 'word'>('pdf');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Report copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy report');
    }
  };

  const handleDownload = () => {
    onDownload?.(downloadFormat);
  };

  return (
    <Card className={cn(
      "border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5",
      isStreaming && "border-primary/40",
      className
    )}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-primary" />
            {title}
            {isStreaming && (
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            )}
          </CardTitle>

          {isComplete && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy
              </Button>

              {onShare && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onShare}
                  className="flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              )}

              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
              )}

              {onDownload && (
                <div className="flex items-center gap-1">
                  <select
                    value={downloadFormat}
                    onChange={(e) => setDownloadFormat(e.target.value as any)}
                    className="px-2 py-1 text-xs border rounded bg-background"
                  >
                    <option value="pdf">PDF</option>
                    <option value="markdown">Markdown</option>
                    <option value="word">Word</option>
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className={cn(
          "prose prose-sm max-w-none",
          "prose-headings:text-foreground prose-p:text-foreground",
          "prose-strong:text-foreground prose-code:text-foreground",
          "prose-blockquote:text-muted-foreground prose-blockquote:border-primary",
          "prose-a:text-primary hover:prose-a:text-primary/80",
          "prose-pre:bg-muted prose-pre:border",
          isStreaming && "animate-pulse"
        )}>
          {content ? (
            <MarkdownRenderer content={content} />
          ) : (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <p>Report will appear here as research completes...</p>
            </div>
          )}
        </div>

        {isStreaming && content && (
          <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm text-primary font-medium">
              ✍️ Research in progress... Report updating in real-time
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};