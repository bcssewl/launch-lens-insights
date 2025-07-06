
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, File, X } from 'lucide-react';

interface FileUploadAreaProps {
  onFileUpload: (files: File[]) => void;
  uploading: string[];
  disabled?: boolean;
}

const FileUploadArea: React.FC<FileUploadAreaProps> = ({ 
  onFileUpload, 
  uploading, 
  disabled = false 
}) => {
  const [uploadQueue, setUploadQueue] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (disabled) return;
    setUploadQueue(acceptedFiles);
    onFileUpload(acceptedFiles);
  }, [onFileUpload, disabled]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    disabled
  });

  const removeFromQueue = (index: number) => {
    setUploadQueue(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <Card 
        className={`border-dashed border-2 transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50 cursor-pointer'}`}
      >
        <CardContent {...getRootProps()} className="flex flex-col items-center justify-center py-12">
          <input {...getInputProps()} />
          <Upload className={`h-12 w-12 mb-4 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
          
          {isDragActive ? (
            <div className="text-center">
              <h3 className="font-semibold text-primary">Drop files here</h3>
              <p className="text-sm text-muted-foreground">Release to upload</p>
            </div>
          ) : (
            <div className="text-center">
              <h3 className="font-semibold mb-2">Drag and drop files here</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Support for PDFs, presentations, images, and documents
              </p>
              <Button variant="outline" disabled={disabled}>
                Choose Files
              </Button>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground mt-2">
            Maximum file size: 50MB
          </div>
        </CardContent>
      </Card>

      {/* Upload Queue */}
      {uploadQueue.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h4 className="font-medium mb-3">Upload Queue</h4>
            <div className="space-y-2">
              {uploadQueue.map((file, index) => (
                <div key={`${file.name}-${index}`} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4" />
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFromQueue(index)}
                    disabled={uploading.length > 0}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            {uploading.length > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Uploading...</span>
                  <span>{uploading.length} files</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUploadArea;
