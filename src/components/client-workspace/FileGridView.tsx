
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Share, Trash2, FileStack } from 'lucide-react';
import { ClientFile } from '@/hooks/useClientFiles';
import EnhancedFilePreview from './EnhancedFilePreview';

interface FileGridViewProps {
  files: ClientFile[];
  onPreview: (file: ClientFile) => void;
  onShare: (file: ClientFile) => void;
  onDelete: (file: ClientFile) => void;
  onVersionHistory: (file: ClientFile) => void;
  getFileUrl: (filePath: string) => Promise<string | null>;
}

const FileGridView: React.FC<FileGridViewProps> = ({
  files,
  onPreview,
  onShare,
  onDelete,
  onVersionHistory,
  getFileUrl
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {files.map((file) => (
        <Card key={file.id} className="group hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="aspect-square mb-3 flex items-center justify-center bg-muted/20 rounded-lg">
              <EnhancedFilePreview 
                file={file} 
                getFileUrl={getFileUrl}
                size="large"
                className="w-full h-full"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm truncate flex-1 mr-2">
                  {file.file_name}
                </h3>
                {file.has_versions && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-xs"
                    onClick={() => onVersionHistory(file)}
                  >
                    <FileStack className="h-3 w-3 mr-1" />
                    {file.version_count}
                  </Button>
                )}
              </div>
              
              <div className="text-xs text-muted-foreground">
                <div>{file.category}</div>
                <div>{(file.file_size / 1024 / 1024).toFixed(2)} MB</div>
                <div>{new Date(file.upload_date).toLocaleDateString()}</div>
              </div>
              
              <div className="flex items-center gap-1 pt-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="flex-1"
                  onClick={() => onPreview(file)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="flex-1"
                  onClick={() => onShare(file)}
                >
                  <Share className="h-3 w-3 mr-1" />
                  Share
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => onDelete(file)}
                  className="text-destructive hover:text-destructive"
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
