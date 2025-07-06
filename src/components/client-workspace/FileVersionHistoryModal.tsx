
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Eye, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ClientFile } from '@/hooks/useClientFiles';

interface FileVersion {
  id: string;
  version_number: number;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_by: string;
  upload_date: string;
}

interface FileVersionHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: ClientFile | null;
  onVersionUpdate?: () => void;
}

const FileVersionHistoryModal: React.FC<FileVersionHistoryModalProps> = ({
  open,
  onOpenChange,
  file,
  onVersionUpdate
}) => {
  const [versions, setVersions] = useState<FileVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && file) {
      fetchVersions();
    }
  }, [open, file]);

  const fetchVersions = async () => {
    if (!file) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('client_file_versions')
        .select('*')
        .eq('parent_file_id', file.id)
        .order('version_number', { ascending: false });

      if (error) throw error;
      setVersions(data || []);
    } catch (error) {
      console.error('Error fetching versions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch file versions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getFileUrl = async (filePath: string) => {
    try {
      const { data } = await supabase.storage
        .from('client-files')
        .createSignedUrl(filePath, 3600);
      return data?.signedUrl;
    } catch (error) {
      console.error('Error getting file URL:', error);
      return null;
    }
  };

  const handleDownload = async (version: FileVersion) => {
    const url = await getFileUrl(version.file_path);
    if (url) {
      const a = document.createElement('a');
      a.href = url;
      a.download = version.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      toast({
        title: "Error",
        description: "Unable to download file version",
        variant: "destructive"
      });
    }
  };

  const handleView = async (version: FileVersion) => {
    const url = await getFileUrl(version.file_path);
    if (url) {
      window.open(url, '_blank');
    } else {
      toast({
        title: "Error",
        description: "Unable to open file version",
        variant: "destructive"
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!file) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Version History: {file.file_name}</DialogTitle>
          <DialogDescription>
            View and manage all versions of this file. You can download or preview any version from the history below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Version Info */}
          <div className="p-4 bg-primary/5 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-primary" />
                  <span className="font-medium">Current Version</span>
                  <Badge variant="default">v{file.current_version}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatFileSize(file.file_size)} • {new Date(file.upload_date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleView(file as any)}>
                  <Eye className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDownload(file as any)}>
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Previous Versions */}
          {versions.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Previous Versions</h4>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {versions.map((version) => (
                    <div key={version.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Version {version.version_number}</span>
                          <Badge variant="outline" className="text-xs">
                            {formatFileSize(version.file_size)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(version.upload_date).toLocaleDateString()} at {new Date(version.upload_date).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleView(version)}>
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDownload(version)}>
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {loading && (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          )}

          {!loading && versions.length === 0 && (
            <div className="text-center text-muted-foreground py-4">
              No previous versions found
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileVersionHistoryModal;
