
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Database, File, Building2 } from 'lucide-react';
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

  const getIcon = () => {
    if (file.type === 'local') {
      return <File className="h-3 w-3" />;
    }
    return file.fileId ? <File className="h-3 w-3" /> : <Building2 className="h-3 w-3" />;
  };

  const getDisplayText = () => {
    if (file.displayName) {
      return file.displayName;
    }
    return file.name;
  };

  return (
    <Badge variant="secondary" className="flex items-center space-x-2 pr-1 max-w-xs">
      {getIcon()}
      <span className="truncate text-xs">
        {getDisplayText()}
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
