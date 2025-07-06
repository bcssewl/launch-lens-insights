
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Image, Presentation, File, AlertTriangle } from 'lucide-react';

interface FileVersionChoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  existingFileInfo?: {
    size: number;
    uploadDate: string;
    versionCount: number;
  };
  onChoice: (choice: 'replace' | 'version') => void;
}

const FileVersionChoiceDialog: React.FC<FileVersionChoiceDialogProps> = ({
  open,
  onOpenChange,
  fileName,
  existingFileInfo,
  onChoice
}) => {
  const getFileIcon = (fileName: string) => {
    const ext = fileName.toLowerCase().split('.').pop();
    if (ext === 'pdf') return <FileText className="h-5 w-5 text-red-500" />;
    if (['ppt', 'pptx'].includes(ext || '')) return <Presentation className="h-5 w-5 text-orange-500" />;
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext || '')) return <Image className="h-5 w-5 text-green-500" />;
    return <File className="h-5 w-5 text-blue-500" />;
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleChoice = (choice: 'replace' | 'version') => {
    onChoice(choice);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            File Already Exists
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            {getFileIcon(fileName)}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{fileName}</p>
              {existingFileInfo && (
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {formatFileSize(existingFileInfo.size)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {existingFileInfo.versionCount} version{existingFileInfo.versionCount !== 1 ? 's' : ''}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(existingFileInfo.uploadDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            A file with this name already exists. How would you like to proceed?
          </p>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4"
              onClick={() => handleChoice('version')}
            >
              <div className="text-left">
                <div className="font-medium">Save as New Version</div>
                <div className="text-sm text-muted-foreground">
                  Keep both files and create version {(existingFileInfo?.versionCount || 1) + 1}
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4"
              onClick={() => handleChoice('replace')}
            >
              <div className="text-left">
                <div className="font-medium">Replace Existing</div>
                <div className="text-sm text-muted-foreground">
                  Overwrite the current file (previous version will be saved)
                </div>
              </div>
            </Button>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileVersionChoiceDialog;
