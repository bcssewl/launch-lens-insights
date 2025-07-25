import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Image, Presentation, File, Eye, Trash2, Upload, FileStack, Share } from 'lucide-react';
import { useClientFiles, FileFilters as FileFiltersType, ViewMode } from '@/hooks/useClientFiles';
import FileUploadArea from './FileUploadArea';
import FileVaultHeader from './FileVaultHeader';
import FileGridView from './FileGridView';
import EnhancedFilePreview from './EnhancedFilePreview';
import FileVersionHistoryModal from './FileVersionHistoryModal';
import FilePreviewDrawer from './FilePreviewDrawer';
import { useToast } from '@/hooks/use-toast';

interface ClientFileVaultProps {
  client: {
    id: string;
    name: string;
  };
}

const ClientFileVault: React.FC<ClientFileVaultProps> = ({ client }) => {
  // Initialize view mode from localStorage or default to 'list'
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('fileVaultViewMode');
    return (saved === 'list' || saved === 'grid') ? saved : 'list';
  });
  
  const [showUploadArea, setShowUploadArea] = useState(false);
  const [versionHistoryFile, setVersionHistoryFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [filters, setFilters] = useState<FileFiltersType>({
    fileType: 'all',
    dateRange: { start: null, end: null },
    category: 'all',
    search: ''
  });

  const { toast } = useToast();
  
  const { 
    files, 
    loading, 
    uploading, 
    uploadFile, 
    deleteFile, 
    getFileUrl, 
    filterFiles,
    refreshFiles
  } = useClientFiles(client.id);

  const filteredFiles = filterFiles(filters);

  const handleFileUpload = async (uploadedFiles: File[]) => {
    for (const file of uploadedFiles) {
      await uploadFile(file);
    }
    setShowUploadArea(false);
  };

  const handlePreview = (file: any) => {
    setPreviewFile(file);
  };

  const handleView = async (file: any) => {
    const url = await getFileUrl(file.file_path);
    if (url) {
      window.open(url, '_blank');
    } else {
      toast({
        title: "Error",
        description: "Unable to open file",
        variant: "destructive"
      });
    }
  };

  const handleShare = async (file: any) => {
    try {
      const url = await getFileUrl(file.file_path);
      if (url) {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copied!",
          description: `Share link for ${file.file_name} copied to clipboard`,
        });
      } else {
        toast({
          title: "Error",
          description: "Unable to generate share link",
          variant: "destructive"
        });
      }
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const url = await getFileUrl(file.file_path);
      if (url) {
        // Create a temporary input element to copy the URL
        const tempInput = document.createElement('input');
        tempInput.value = url;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        
        toast({
          title: "Link copied!",
          description: `Share link for ${file.file_name} copied to clipboard`,
        });
      } else {
        toast({
          title: "Error",
          description: "Unable to generate share link",
          variant: "destructive"
        });
      }
    }
  };

  const handleDelete = (file: any) => {
    if (confirm(`Are you sure you want to delete ${file.file_name}?`)) {
      deleteFile(file.id);
    }
  };

  const handleVersionHistory = (file: any) => {
    setVersionHistoryFile(file);
  };

  const clearFilters = () => {
    setFilters({
      fileType: 'all',
      dateRange: { start: null, end: null },
      category: 'all',
      search: ''
    });
  };

  const getCategoryStats = () => {
    const stats = {
      PDF: files.filter(f => f.file_type.includes('pdf')).length,
      Presentation: files.filter(f => f.file_type.includes('presentation') || f.file_type.includes('powerpoint')).length,
      Document: files.filter(f => f.file_type.includes('document') || f.file_type.includes('word')).length,
      Image: files.filter(f => f.file_type.includes('image')).length
    };
    return stats;
  };

  const categoryStats = getCategoryStats();

  const handleUploadComplete = () => {
    // Refresh the files list after successful upload
    refreshFiles();
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading files...</div>;
  }

  return (
    <div className="space-y-6">
      {/* File Vault Header */}
      <FileVaultHeader
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        fileCount={filteredFiles.length}
        totalFiles={files.length}
        clientId={client.id}
        onUploadComplete={handleUploadComplete}
      />

      {/* Upload Area - keeping this for backward compatibility if needed */}
      {showUploadArea && (
        <FileUploadArea
          onFileUpload={handleFileUpload}
          uploading={uploading}
          disabled={uploading.length > 0}
        />
      )}

      {/* File Categories Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="text-center">
          <CardContent className="pt-6">
            <FileText className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <div className="font-semibold">PDFs</div>
            <div className="text-sm text-muted-foreground">{categoryStats.PDF} files</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <Presentation className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <div className="font-semibold">Presentations</div>
            <div className="text-sm text-muted-foreground">{categoryStats.Presentation} files</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <File className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="font-semibold">Documents</div>
            <div className="text-sm text-muted-foreground">{categoryStats.Document} files</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <Image className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="font-semibold">Images</div>
            <div className="text-sm text-muted-foreground">{categoryStats.Image} files</div>
          </CardContent>
        </Card>
      </div>

      {/* Files Display */}
      {filteredFiles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Upload className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No files found</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              {files.length === 0 
                ? "Upload your first file to get started" 
                : "Try adjusting your filters to see more files"
              }
            </p>
            {files.length === 0 && (
              <Button onClick={() => setShowUploadArea(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <FileGridView
              files={filteredFiles}
              onPreview={handlePreview}
              onShare={handleShare}
              onDelete={handleDelete}
              onVersionHistory={handleVersionHistory}
              getFileUrl={getFileUrl}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Files ({filteredFiles.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <EnhancedFilePreview 
                          file={file} 
                          getFileUrl={getFileUrl}
                          size="small"
                          showTextPreview={false}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{file.file_name}</div>
                            {file.has_versions && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 text-xs"
                                onClick={() => handleVersionHistory(file)}
                              >
                                <FileStack className="h-3 w-3 mr-1" />
                                {file.version_count}
                              </Button>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {file.category} • {(file.file_size / 1024 / 1024).toFixed(2)} MB • {new Date(file.upload_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handlePreview(file)}>
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleShare(file)}>
                          <Share className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleDelete(file)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Storage Info */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Used</span>
              <span>{(files.reduce((acc, file) => acc + file.file_size, 0) / 1024 / 1024).toFixed(2)} MB of 1 GB</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ 
                  width: `${Math.min((files.reduce((acc, file) => acc + file.file_size, 0) / 1024 / 1024 / 1024) * 100, 100)}%` 
                }}
              ></div>
            </div>
            <div className="text-xs text-muted-foreground">
              Space remaining for your files
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Preview Drawer */}
      <FilePreviewDrawer
        open={!!previewFile}
        onOpenChange={(open) => !open && setPreviewFile(null)}
        file={previewFile}
        getFileUrl={getFileUrl}
        onDownload={handleShare}
        onVersionHistory={handleVersionHistory}
      />

      {/* Version History Modal */}
      <FileVersionHistoryModal
        open={!!versionHistoryFile}
        onOpenChange={(open) => !open && setVersionHistoryFile(null)}
        file={versionHistoryFile}
        onVersionUpdate={refreshFiles}
      />
    </div>
  );
};

export default ClientFileVault;
