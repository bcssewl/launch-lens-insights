
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Upload, X, FileText, Image, Presentation, File, AlertTriangle, Check } from 'lucide-react';
import { useFileUpload, FileWithMetadata } from '@/hooks/useFileUpload';
import FileVersionChoiceDialog from './FileVersionChoiceDialog';
import { cn } from '@/lib/utils';

interface FileUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  onUploadComplete?: () => void;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({
  open,
  onOpenChange,
  clientId,
  onUploadComplete
}) => {
  const {
    files,
    uploading,
    duplicateFiles,
    addFiles,
    updateFileTags,
    updateFileCategory,
    removeFile,
    uploadFiles,
    clearFiles,
    handleVersionChoice
  } = useFileUpload(clientId);

  const [dragActive, setDragActive] = useState(false);
  const [versionChoiceFile, setVersionChoiceFile] = useState<FileWithMetadata | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    addFiles(acceptedFiles);
  }, [addFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg'],
      'text/*': ['.txt', '.csv']
    }
  });

  const getFileIcon = (file: File) => {
    if (file.type.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />;
    if (file.type.includes('presentation') || file.type.includes('powerpoint')) return <Presentation className="h-4 w-4 text-orange-500" />;
    if (file.type.includes('image')) return <Image className="h-4 w-4 text-green-500" />;
    return <File className="h-4 w-4 text-gray-500" />;
  };

  const getStatusIcon = (status: FileWithMetadata['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'duplicate-choice':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return null;
    }
  };

  const handleVersionChoiceClick = (file: FileWithMetadata) => {
    setVersionChoiceFile(file);
  };

  const handleVersionChoiceSubmit = (choice: 'replace' | 'version') => {
    if (versionChoiceFile) {
      handleVersionChoice(versionChoiceFile.id, choice);
      setVersionChoiceFile(null);
    }
  };

  const handleUpload = async () => {
    await uploadFiles();
    if (onUploadComplete) {
      onUploadComplete();
    }
  };

  const handleClose = () => {
    if (!uploading) {
      clearFiles();
      onOpenChange(false);
    }
  };

  const availableCategories = [
    'Research',
    'Financials', 
    'Legal',
    'Financial Documents',
    'Presentations',
    'Research Documents',
    'Brand Assets',
    'Charts & Graphs'
  ];

  const hasDuplicateChoices = files.some(f => f.status === 'duplicate-choice');
  const canUpload = files.length > 0 && !hasDuplicateChoices && !uploading;

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
          </DialogHeader>

          <div className="flex-1 space-y-6 overflow-hidden">
            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragActive || dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                "hover:border-primary hover:bg-primary/5"
              )}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                }
              }}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                {isDragActive ? "Drop files here..." : "Drag & drop files here, or click to select"}
              </p>
              <p className="text-sm text-muted-foreground">
                Supports PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, images, and text files
              </p>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-4 flex-1 min-h-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Files to Upload ({files.length})</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearFiles}
                    disabled={uploading}
                  >
                    Clear All
                  </Button>
                </div>

                <ScrollArea className="h-64 border rounded-lg p-4">
                  <div className="space-y-4">
                    {files.map((fileMetadata, index) => (
                      <div key={fileMetadata.id}>
                        <div className="flex items-start gap-4 p-4 border rounded-lg">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {getFileIcon(fileMetadata.file)}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium truncate">{fileMetadata.file.name}</p>
                                {getStatusIcon(fileMetadata.status)}
                                {fileMetadata.duplicateInfo && (
                                  <Badge variant="destructive" className="text-xs">Duplicate</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {(fileMetadata.file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                              
                              {fileMetadata.status === 'uploading' && (
                                <Progress value={fileMetadata.uploadProgress} className="mt-2" />
                              )}
                              
                              {fileMetadata.error && (
                                <p className="text-sm text-red-500 mt-1">{fileMetadata.error}</p>
                              )}

                              {fileMetadata.status === 'duplicate-choice' && (
                                <div className="mt-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleVersionChoiceClick(fileMetadata)}
                                    className="text-amber-600 border-amber-200 hover:bg-amber-50"
                                  >
                                    Choose Version Option
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex-shrink-0 space-y-3 min-w-[200px]">
                            {/* Category Selection */}
                            <div>
                              <Label className="text-xs">Category</Label>
                              <Select
                                value={fileMetadata.category || ''}
                                onValueChange={(value) => updateFileCategory(fileMetadata.id, value || null)}
                                disabled={uploading || fileMetadata.status === 'duplicate-choice'}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableCategories.map(category => (
                                    <SelectItem key={category} value={category}>
                                      {category}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Tags */}
                            <div>
                              <Label className="text-xs">
                                Suggested Tags ({Math.round(fileMetadata.confidenceScore * 100)}% confidence)
                              </Label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {fileMetadata.suggestedTags.map(tag => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(fileMetadata.id)}
                            disabled={uploading}
                            className="flex-shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        {index < files.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {files.length > 0 && (
                <>
                  <span>{files.length} file(s) selected</span>
                  {duplicateFiles.length > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-amber-500">{duplicateFiles.length} duplicate(s)</span>
                    </>
                  )}
                  {hasDuplicateChoices && (
                    <>
                      <span>•</span>
                      <span className="text-amber-500">Please resolve duplicate file choices</span>
                    </>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleClose} disabled={uploading}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpload}
                disabled={!canUpload}
                loading={uploading}
              >
                {uploading ? 'Uploading...' : `Upload ${files.filter(f => f.status !== 'duplicate-choice').length} File(s)`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Version Choice Dialog */}
      <FileVersionChoiceDialog
        open={!!versionChoiceFile}
        onOpenChange={(open) => !open && setVersionChoiceFile(null)}
        fileName={versionChoiceFile?.file.name || ''}
        existingFileInfo={versionChoiceFile?.duplicateInfo ? {
          size: versionChoiceFile.duplicateInfo.existingFileSize,
          uploadDate: versionChoiceFile.duplicateInfo.existingUploadDate,
          versionCount: versionChoiceFile.duplicateInfo.versionCount
        } : undefined}
        onChoice={handleVersionChoiceSubmit}
      />
    </>
  );
};

export default FileUploadModal;
