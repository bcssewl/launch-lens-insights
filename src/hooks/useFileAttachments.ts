
import { useState } from 'react';

export interface AttachedFile {
  id: string;
  name: string;
  type: 'database' | 'local';
  size?: number;
  file?: File;
  projectId?: string;
  fileId?: string; // For individual file attachments
  displayName?: string; // For better display in chips
}

export const useFileAttachments = () => {
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);

  const addDatabaseFile = (projectId: string, projectName: string, fileId?: string, fileName?: string) => {
    const newFile: AttachedFile = {
      id: fileId ? `db-file-${fileId}` : `db-project-${projectId}`,
      name: fileName || projectName,
      type: 'database',
      projectId,
      fileId,
      displayName: fileId ? `${fileName} (${projectName})` : projectName,
    };
    
    // Remove existing attachment if it's the same file or project
    setAttachedFiles(prev => [
      ...prev.filter(f => f.id !== newFile.id),
      newFile
    ]);
  };

  const addLocalFile = (file: File) => {
    const newFile: AttachedFile = {
      id: `local-${Date.now()}-${Math.random()}`,
      name: file.name,
      type: 'local',
      size: file.size,
      file,
      displayName: file.name,
    };
    
    setAttachedFiles(prev => [...prev, newFile]);
  };

  const removeFile = (fileId: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const clearFiles = () => {
    setAttachedFiles([]);
  };

  return {
    attachedFiles,
    addDatabaseFile,
    addLocalFile,
    removeFile,
    clearFiles,
  };
};
