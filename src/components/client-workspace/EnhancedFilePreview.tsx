import React, { useState, useEffect } from 'react';
import { FileText, Image, Presentation, File, FileCode, FileSpreadsheet, Loader2 } from 'lucide-react';
import { ClientFile } from '@/hooks/useClientFiles';
import { getPreviewGenerator, PreviewResult } from '@/utils/previewGenerators';

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textPreview, setTextPreview] = useState<string | null>(null);
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
        console.log('Loading preview for file:', file.file_name, 'type:', file.file_type);
        
        // For images, use direct URL
        if (file.file_type.includes('image')) {
          const url = await getFileUrl(file.file_path);
          if (url) {
            setPreviewUrl(url);
          } else {
            setHasError(true);
          }
        } else {
          // For other file types, generate preview
          const url = await getFileUrl(file.file_path);
          if (url && showTextPreview) {
            const response = await fetch(url);
            const blob = await response.blob();
            
            // Create a file-like object that preserves blob methods and adds File properties
            const fileObject = Object.create(blob);
            fileObject.name = file.file_name;
            fileObject.type = file.file_type;
            fileObject.lastModified = Date.now();
            fileObject.size = blob.size;
            
            console.log('Created file object for preview generation:', fileObject.name, fileObject.type);
            
            const previewGenerator = getPreviewGenerator(file.file_type);
            if (previewGenerator) {
              console.log('Found preview generator for type:', file.file_type);
              const result: PreviewResult = await previewGenerator(fileObject);
              
              console.log('Preview generation result:', result.type, result.error || 'success');
              
              if (result.type === 'image') {
                setPreviewUrl(result.content);
              } else if (result.type === 'text') {
                setTextPreview(result.content);
              } else if (result.type === 'error') {
                console.error('Preview generation error:', result.error);
                setHasError(true);
              }
            } else {
              console.log('No preview generator found for type:', file.file_type);
            }
          }
        }
      } catch (error) {
        console.error('Error loading preview for', file.file_name, ':', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreview();
  }, [file.file_path, file.file_type, getFileUrl, showTextPreview]);

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

  // Show image preview
  if (previewUrl && file.file_type.includes('image')) {
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

  // Show generated preview (like PDF thumbnail)
  if (previewUrl && !file.file_type.includes('image')) {
    return (
      <div className={containerClass}>
        <img
          src={previewUrl}
          alt={`${file.file_name} preview`}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  // Show text preview for text-based files
  if (textPreview && size !== 'small') {
    return (
      <div className={`${className} rounded-lg overflow-hidden bg-muted/50 p-2 min-h-[${sizeClasses[size].split(' ')[1]}]`}>
        <div className="flex items-center gap-1 mb-1">
          {getFileIcon(file.file_type)}
        </div>
        <div className="text-xs text-muted-foreground leading-tight overflow-hidden">
          {textPreview}
        </div>
      </div>
    );
  }

  // Fallback to enhanced file type icons
  return (
    <div className={containerClass}>
      {getFileIcon(file.file_type)}
    </div>
  );
};

export default EnhancedFilePreview;
