
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Database, File } from 'lucide-react';
import { AttachedFile } from '@/hooks/useFileAttachments';

interface AttachedFileChipProps {
  file: AttachedFile;
  onRemove: (fileId: string) => void;
}

const AttachedFileChip: React.FC<AttachedFileChipProps> = ({ file, onRemove }) => {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${Math.round(bytes / (1024 * 1024))} MB`;
  };

  return (
    <Badge variant="secondary" className="flex items-center space-x-2 pr-1 max-w-xs">
      {file.type === 'database' ? (
        <Database className="h-3 w-3" />
      ) : (
        <File className="h-3 w-3" />
      )}
      <span className="truncate text-xs">
        {file.name}
        {file.size && (
          <span className="text-muted-foreground ml-1">
            ({formatFileSize(file.size)})
          </span>
        )}
      </span>
      <Button
        variant="ghost"
        size="sm"
        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
        onClick={() => onRemove(file.id)}
      >
        <X className="h-3 w-3" />
      </Button>
    </Badge>
  );
};

export default AttachedFileChip;
