/**
 * @file DownloadMenu.tsx
 * @description Professional download menu with multiple format support
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  FileText,
  Globe,
  Loader2,
  File,
  FileCode,
} from 'lucide-react';
import { downloadReport, getFormatInfo } from '@/utils/downloadReport';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface DownloadMenuProps {
  content: string;
  title: string;
  className?: string;
  variant?: 'ghost' | 'outline' | 'default';
  size?: 'sm' | 'default' | 'lg' | 'icon';
  showLabel?: boolean;
}

const formatConfig = [
  {
    format: 'md' as const,
    icon: FileCode,
    label: 'Markdown',
    description: 'Structured text with formatting',
    color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800',
  },
  {
    format: 'pdf' as const,
    icon: FileText,
    label: 'PDF',
    description: 'Professional document format',
    color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800',
  },
  {
    format: 'html' as const,
    icon: Globe,
    label: 'HTML',
    description: 'Web page format',
    color: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800',
  },
  {
    format: 'txt' as const,
    icon: File,
    label: 'Plain Text',
    description: 'Simple text without formatting',
    color: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:text-gray-300 dark:border-gray-800',
  },
  {
    format: 'docx' as const,
    icon: FileText,
    label: 'Word Document',
    description: 'Microsoft Word compatible',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-800',
  },
];

export const DownloadMenu: React.FC<DownloadMenuProps> = ({
  content,
  title,
  className,
  variant = 'ghost',
  size = 'icon',
  showLabel = false,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDownload = async (format: 'md' | 'pdf' | 'docx' | 'txt' | 'html') => {
    setIsDownloading(true);
    setDownloadingFormat(format);
    
    try {
      const filename = await downloadReport({
        content,
        title,
        format,
        includeTimestamp: true,
      });

      const formatInfo = getFormatInfo(format);
      
      toast({
        title: 'Download completed',
        description: `Successfully saved as ${filename}`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: 'Download failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
      setDownloadingFormat(null);
    }
  };

  const isFormatDownloading = (format: string) => {
    return isDownloading && downloadingFormat === format;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn(
            "transition-all duration-200",
            variant === 'ghost' && "text-muted-foreground hover:text-foreground",
            className
          )}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {showLabel && <span className="ml-2">Download</span>}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="p-2 space-y-1">
          {formatConfig.map(({ format, icon: Icon, label, description, color }) => (
            <DropdownMenuItem
              key={format}
              onClick={() => handleDownload(format)}
              disabled={isDownloading}
              className="cursor-pointer p-3 rounded-md hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-3 w-full">
                <div className="flex-shrink-0 mt-0.5">
                  {isFormatDownloading(format) ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : (
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-foreground">
                      {label}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn("text-xs", color)}
                    >
                      .{getFormatInfo(format).extension}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </div>
        
        <DropdownMenuSeparator />
        
        <div className="p-2">
          <div className="text-xs text-muted-foreground text-center">
            Files include professional formatting and timestamps
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};