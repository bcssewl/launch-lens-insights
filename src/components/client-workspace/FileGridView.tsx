
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Eye, Trash2 } from 'lucide-react';
import { ClientFile } from '@/hooks/useClientFiles';
import EnhancedFilePreview from './EnhancedFilePreview';

interface FileGridViewProps {
  files: ClientFile[];
  onView: (file: ClientFile) => void;
  onDownload: (file: ClientFile) => void;
  onDelete: (file: ClientFile) => void;
  getFileUrl: (filePath: string) => Promise<string | null>;
}

const FileGridView: React.FC<FileGridViewProps> = ({
  files,
  onView,
  onDownload,
  onDelete,
  getFileUrl
}) => {
  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {files.map((file) => (
        <Card key={file.id} className="hover:shadow-md transition-shadow group">
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center space-y-3">
              {/* Enhanced File Preview */}
              <EnhancedFilePreview 
                file={file} 
                getFileUrl={getFileUrl}
                size="large"
                className="border"
                showTextPreview={true}
              />

              {/* File Info */}
              <div className="flex-1 min-w-0 w-full">
                <h4 className="font-medium text-sm truncate" title={file.file_name}>
                  {file.file_name}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatFileSize(file.file_size)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(file.upload_date).toLocaleDateString()}
                </p>
              </div>

              {/* Category Badge */}
              {file.category && (
                <Badge variant="outline" className="text-xs">
                  {file.category}
                </Badge>
              )}

              {/* Actions */}
              <div className="flex gap-1 w-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onView(file)}
                  className="flex-1"
                >
                  <Eye className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDownload(file)}
                  className="flex-1"
                >
                  <Download className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(file)}
                  className="flex-1 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FileGridView;
