
import { useState } from 'react';

export interface AttachedFile {
  id: string;
  name: string;
  type: 'database' | 'local';
  size?: number;
  file?: File;
  projectId?: string;
}

export const useFileAttachments = () => {
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);

  const addDatabaseFile = (projectId: string, projectName: string) => {
    const newFile: AttachedFile = {
      id: `db-${projectId}`,
      name: projectName,
      type: 'database',
      projectId,
    };
    
    setAttachedFiles(prev => [...prev.filter(f => f.id !== newFile.id), newFile]);
  };

  const addLocalFile = (file: File) => {
    const newFile: AttachedFile = {
      id: `local-${Date.now()}-${Math.random()}`,
      name: file.name,
      type: 'local',
      size: file.size,
      file,
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
