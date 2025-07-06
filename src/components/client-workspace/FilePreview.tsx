
import React, { useState, useEffect } from 'react';
import { FileText, Image, Presentation, File } from 'lucide-react';
import { ClientFile } from '@/hooks/useClientFiles';

interface FilePreviewProps {
  file: ClientFile;
  getFileUrl: (filePath: string) => Promise<string | null>;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const FilePreview: React.FC<FilePreviewProps> = ({ 
  file, 
  getFileUrl, 
  size = 'medium',
  className = '' 
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-16 h-16',
    large: 'w-24 h-24'
  };

  const iconSizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  useEffect(() => {
    const loadPreview = async () => {
      if (!file.file_type.includes('image')) {
        setIsLoading(false);
        return;
      }

      try {
        const url = await getFileUrl(file.file_path);
        if (url) {
          setPreviewUrl(url);
        } else {
          setHasError(true);
        }
      } catch (error) {
        console.error('Error loading preview:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreview();
  }, [file.file_path, file.file_type, getFileUrl]);

  const getFileIcon = (type: string) => {
    const iconClass = iconSizeClasses[size];
    
    if (type.includes('pdf')) return <FileText className={`${iconClass} text-red-500`} />;
    if (type.includes('presentation') || type.includes('powerpoint')) return <Presentation className={`${iconClass} text-orange-500`} />;
    if (type.includes('image')) return <Image className={`${iconClass} text-green-500`} />;
    return <File className={`${iconClass} text-blue-500`} />;
  };

  const containerClass = `${sizeClasses[size]} ${className} rounded-lg overflow-hidden bg-muted/50 flex items-center justify-center`;

  if (file.file_type.includes('image')) {
    if (isLoading) {
      return (
        <div className={`${containerClass} animate-pulse`}>
          <Image className={iconSizeClasses[size] + ' text-muted-foreground'} />
        </div>
      );
    }

    if (hasError || !previewUrl) {
      return (
        <div className={containerClass}>
          {getFileIcon(file.file_type)}
        </div>
      );
    }

    return (
      <div className={containerClass}>
        <img
          src={previewUrl}
          alt={file.file_name}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  // For non-image files, show enhanced file type icons
  return (
    <div className={containerClass}>
      {getFileIcon(file.file_type)}
    </div>
  );
};

export default FilePreview;
