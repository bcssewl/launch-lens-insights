
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MoreVertical, 
  Download, 
  Trash2, 
  Eye,
  Calendar,
  HardDrive,
  FileStack,
  Share
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ClientFile } from '@/hooks/useClientFiles';
import EnhancedFilePreview from './EnhancedFilePreview';
import ContentExtractionStatus from './ContentExtractionStatus';
import AutoContentExtraction from './AutoContentExtraction';

interface FileGridViewProps {
  files: ClientFile[];
  onFileSelect: (file: ClientFile) => void;
  onFileDelete: (fileId: string) => void;
  onFileDownload?: (file: ClientFile) => void;
  getFileUrl: (filePath: string) => Promise<string | null>;
  onPreview: (file: ClientFile) => void;
  onShare: (file: ClientFile) => Promise<void>;
  onVersionHistory: (file: ClientFile) => void;
}

const FileGridView: React.FC<FileGridViewProps> = ({
  files,
  onFileSelect,
  onFileDelete,
  onFileDownload,
  getFileUrl,
  onPreview,
  onShare,
  onVersionHistory
}) => {
  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No files found matching your criteria</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {files.map((file) => (
        <Card key={file.id} className="group hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            {/* Auto-extract content for files that don't have it */}
            <AutoContentExtraction
              fileId={file.id}
              fileName={file.file_name}
              hasContent={Boolean(file.content_extracted_at && file.file_content_text)}
            />
            
            <div className="flex flex-col space-y-3">
              {/* File Preview */}
              <div className="flex justify-center">
                <EnhancedFilePreview
                  file={file}
                  getFileUrl={getFileUrl}
                  size="large"
                />
              </div>

              {/* File Info */}
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h3 
                    className="font-medium text-sm line-clamp-2 cursor-pointer hover:text-primary"
                    onClick={() => onFileSelect(file)}
                    title={file.file_name}
                  >
                    {file.file_name}
                  </h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onPreview(file)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onShare(file)}>
                        <Share className="mr-2 h-4 w-4" />
                        Share
                      </DropdownMenuItem>
                      {file.has_versions && (
                        <DropdownMenuItem onClick={() => onVersionHistory(file)}>
                          <FileStack className="mr-2 h-4 w-4" />
                          Version History
                        </DropdownMenuItem>
                      )}
                      {onFileDownload && (
                        <DropdownMenuItem onClick={() => onFileDownload(file)}>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => onFileDelete(file.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Content Extraction Status */}
                <ContentExtractionStatus file={file} size="sm" />

                {/* File Metadata */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <HardDrive className="h-3 w-3" />
                  <span>{formatFileSize(file.file_size)}</span>
                  <Calendar className="h-3 w-3 ml-2" />
                  <span>{new Date(file.upload_date).toLocaleDateString()}</span>
                </div>

                {/* Category Badge */}
                {file.category && (
                  <Badge variant="outline" className="text-xs">
                    {file.category}
                  </Badge>
                )}

                {/* Content Summary Preview */}
                {file.content_summary && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {file.content_summary}
                  </p>
                )}

                {/* Keywords */}
                {file.content_keywords && file.content_keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {file.content_keywords.slice(0, 3).map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
                        {keyword}
                      </Badge>
                    ))}
                    {file.content_keywords.length > 3 && (
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        +{file.content_keywords.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FileGridView;
