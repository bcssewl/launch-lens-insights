
import React from 'react';
import AttachedFileChip from './AttachedFileChip';
import { AttachedFile } from '@/hooks/useFileAttachments';

interface AttachmentsListProps {
  attachedFiles: AttachedFile[];
  onRemoveFile: (fileId: string) => void;
}

const AttachmentsList: React.FC<AttachmentsListProps> = ({
  attachedFiles,
  onRemoveFile,
}) => {
  if (attachedFiles.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      <div className="text-xs text-muted-foreground">Attached files:</div>
      <div className="flex flex-wrap gap-2">
        {attachedFiles.map(file => (
          <AttachedFileChip
            key={file.id}
            file={file}
            onRemove={onRemoveFile}
          />
        ))}
      </div>
    </div>
  );
};

export default AttachmentsList;
