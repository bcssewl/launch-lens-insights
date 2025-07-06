
import React from 'react';
import { ClientFile } from '@/hooks/useClientFiles';
import SimplifiedFilePreview from './SimplifiedFilePreview';

interface EnhancedFilePreviewProps {
  file: ClientFile;
  getFileUrl: (filePath: string) => Promise<string | null>;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  showTextPreview?: boolean;
}

const EnhancedFilePreview: React.FC<EnhancedFilePreviewProps> = ({ 
  file, 
  getFileUrl, 
  size = 'medium',
  className = '',
  showTextPreview = true
}) => {
  return (
    <SimplifiedFilePreview
      file={file}
      getFileUrl={getFileUrl}
      size={size}
      className={className}
      showDirectPreview={showTextPreview}
    />
  );
};

export default EnhancedFilePreview;
