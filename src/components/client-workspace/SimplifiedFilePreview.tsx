
import React, { useState, useEffect } from 'react';
import { FileText, Image, Presentation, File, FileCode, FileSpreadsheet, Loader2 } from 'lucide-react';
import { ClientFile } from '@/hooks/useClientFiles';

interface SimplifiedFilePreviewProps {
  file: ClientFile;
  getFileUrl: (filePath: string) => Promise<string | null>;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  showDirectPreview?: boolean;
}

const SimplifiedFilePreview: React.FC<SimplifiedFilePreviewProps> = ({ 
  file, 
  getFileUrl, 
  size = 'medium',
  className = '',
  showDirectPreview = false
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
      setIsLoading(true);
      setHasError(false);

      try {
        console.log('Loading simplified preview for file:', file.file_name, 'type:', file.file_type);
        const url = await getFileUrl(file.file_path);
        
        if (url) {
          setPreviewUrl(url);
        } else {
          setHasError(true);
        }
      } catch (error) {
        console.error('Error loading preview for', file.file_name, ':', error);
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
    if (type.includes('text') || type.includes('json') || type.includes('csv')) return <FileCode className={`${iconClass} text-blue-500`} />;
    if (type.includes('sheet') || type.includes('excel')) return <FileSpreadsheet className={`${iconClass} text-emerald-500`} />;
    return <File className={`${iconClass} text-gray-500`} />;
  };

  const containerClass = `${sizeClasses[size]} ${className} rounded-lg overflow-hidden bg-muted/50 flex items-center justify-center relative`;

  if (isLoading) {
    return (
      <div className={`${containerClass} animate-pulse`}>
        <Loader2 className={`${iconSizeClasses[size]} text-muted-foreground animate-spin`} />
      </div>
    );
  }

  // Show direct preview for images
  if (file.file_type.includes('image') && previewUrl && !hasError) {
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

  // For PDFs, show a preview thumbnail if requested and size is not small
  if (file.file_type.includes('pdf') && previewUrl && !hasError && showDirectPreview && size !== 'small') {
    return (
      <div className={`${className} rounded-lg overflow-hidden bg-muted/50 min-h-[${sizeClasses[size].split(' ')[1]}]`}>
        <iframe
          src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
          className="w-full h-32 border-0"
          title={`Preview of ${file.file_name}`}
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  // Fallback to file type icons
  return (
    <div className={containerClass}>
      {getFileIcon(file.file_type)}
    </div>
  );
};

export default SimplifiedFilePreview;
