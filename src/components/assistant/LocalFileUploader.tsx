
import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, File } from 'lucide-react';

interface LocalFileUploaderProps {
  open: boolean;
  onClose: () => void;
  onFileSelect: (file: File) => void;
}

const LocalFileUploader: React.FC<LocalFileUploaderProps> = ({
  open,
  onClose,
  onFileSelect,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        onFileSelect(file);
      });
      onClose();
    }
  };

  const handleBrowseFiles = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        onFileSelect(file);
      });
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Local Files</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:bg-muted/50 cursor-pointer transition-colors"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleBrowseFiles}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Drop files here or click to browse</p>
            <p className="text-sm text-muted-foreground">
              Supports PDF, DOCX, TXT, and image files
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleBrowseFiles}>
              <File className="mr-2 h-4 w-4" />
              Browse Files
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocalFileUploader;
