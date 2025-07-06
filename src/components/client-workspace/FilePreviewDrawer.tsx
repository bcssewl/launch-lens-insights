
import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Download, 
  FileText, 
  Calendar, 
  HardDrive, 
  Tag, 
  MessageCircle,
  Send,
  FileStack,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ClientFile } from '@/hooks/useClientFiles';
import { getPreviewGenerator } from '@/utils/previewGenerators';
import * as pdfjsLib from 'pdfjs-dist';

interface FilePreviewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: ClientFile | null;
  getFileUrl: (filePath: string) => Promise<string | null>;
  onDownload?: (file: ClientFile) => void;
  onVersionHistory?: (file: ClientFile) => void;
}

const FilePreviewDrawer: React.FC<FilePreviewDrawerProps> = ({
  open,
  onOpenChange,
  file,
  getFileUrl,
  onDownload,
  onVersionHistory
}) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'pdf' | 'image' | 'text' | 'error' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pdfDocument, setPdfDocument] = useState<any>(null);

  // Load file URL and preview when file changes
  useEffect(() => {
    if (file && open) {
      loadFilePreview();
    } else {
      resetPreviewState();
    }
  }, [file, open]);

  const resetPreviewState = () => {
    setFileUrl(null);
    setPreviewContent(null);
    setPreviewType(null);
    setIsLoading(false);
    setCurrentPage(1);
    setTotalPages(1);
    setZoomLevel(1);
    setPdfDocument(null);
  };

  const loadFilePreview = async () => {
    if (!file) return;

    setIsLoading(true);
    try {
      // Get signed URL
      const url = await getFileUrl(file.file_path);
      setFileUrl(url);

      if (url) {
        await generatePreview(url);
      }
    } catch (error) {
      console.error('Error loading file preview:', error);
      setPreviewType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const generatePreview = async (url: string) => {
    if (!file) return;

    // Handle different file types
    if (file.file_type.includes('image')) {
      setPreviewType('image');
      setPreviewContent(url);
    } else if (file.file_type.includes('pdf')) {
      await loadPDFPreview(url);
    } else {
      // Use existing preview generators for other file types
      const generator = getPreviewGenerator(file.file_type);
      if (generator) {
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          const tempFile = new File([blob], file.file_name, { type: file.file_type });
          const result = await generator(tempFile);
          
          if (result.type === 'error') {
            setPreviewType('error');
          } else {
            setPreviewType(result.type as 'text' | 'image');
            setPreviewContent(result.content);
          }
        } catch (error) {
          console.error('Error generating preview:', error);
          setPreviewType('error');
        }
      } else {
        setPreviewType('error');
      }
    }
  };

  const loadPDFPreview = async (url: string) => {
    try {
      const pdf = await pdfjsLib.getDocument(url).promise;
      setPdfDocument(pdf);
      setTotalPages(pdf.numPages);
      setPreviewType('pdf');
      await renderPDFPage(pdf, 1);
    } catch (error) {
      console.error('Error loading PDF:', error);
      setPreviewType('error');
    }
  };

  const renderPDFPage = async (pdf: any, pageNumber: number) => {
    try {
      const page = await pdf.getPage(pageNumber);
      const scale = zoomLevel * 1.5;
      const viewport = page.getViewport({ scale });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      await page.render({ canvasContext: context, viewport }).promise;
      setPreviewContent(canvas.toDataURL());
      setCurrentPage(pageNumber);
    } catch (error) {
      console.error('Error rendering PDF page:', error);
    }
  };

  const handlePrevPage = () => {
    if (pdfDocument && currentPage > 1) {
      renderPDFPage(pdfDocument, currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (pdfDocument && currentPage < totalPages) {
      renderPDFPage(pdfDocument, currentPage + 1);
    }
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(zoomLevel + 0.25, 3);
    setZoomLevel(newZoom);
    if (pdfDocument) {
      renderPDFPage(pdfDocument, currentPage);
    }
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel - 0.25, 0.5);
    setZoomLevel(newZoom);
    if (pdfDocument) {
      renderPDFPage(pdfDocument, currentPage);
    }
  };

  const handleSendMessage = () => {
    if (chatMessage.trim() && file) {
      // Stub implementation - log to console
      console.log({
        action: 'ask_nexus',
        fileId: file.id,
        fileName: file.file_name,
        question: chatMessage.trim(),
        timestamp: new Date()
      });
      
      setChatMessage('');
      // TODO: Show success feedback
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[80vw] lg:w-[70vw] p-0 flex flex-col max-w-none">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="text-left">{file.file_name}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Preview Area */}
          <div className="flex-1 flex flex-col">
            {/* Preview Controls for PDF */}
            {previewType === 'pdf' && (
              <div className="p-4 border-b flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handlePrevPage}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    {currentPage} of {totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={handleZoomOut}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">{Math.round(zoomLevel * 100)}%</span>
                  <Button size="sm" variant="outline" onClick={handleZoomIn}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Preview Content */}
            <ScrollArea className="flex-1 p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : previewType === 'image' && previewContent ? (
                <div className="flex justify-center">
                  <img 
                    src={previewContent} 
                    alt={file.file_name}
                    className="max-w-full h-auto shadow-lg"
                  />
                </div>
              ) : previewType === 'pdf' && previewContent ? (
                <div className="flex justify-center">
                  <img 
                    src={previewContent} 
                    alt={`Page ${currentPage} of ${file.file_name}`}
                    className="max-w-full h-auto shadow-lg"
                  />
                </div>
              ) : previewType === 'text' && previewContent ? (
                <div className="bg-muted/20 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">{previewContent}</pre>
                </div>
              ) : previewType === 'error' ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <FileText className="h-12 w-12 mb-4" />
                  <p>Preview not available</p>
                  <p className="text-sm">Click download to view this file</p>
                </div>
              ) : null}
            </ScrollArea>

            {/* Ask Nexus Chat Input */}
            <div className="p-4 border-t">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Ask Nexus about this file..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                </div>
                <Button 
                  size="sm" 
                  onClick={handleSendMessage}
                  disabled={!chatMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Metadata Sidebar */}
          <div className="w-80 border-l bg-muted/20">
            <ScrollArea className="h-full p-6">
              <div className="space-y-6">
                {/* File Information */}
                <div>
                  <h3 className="font-semibold mb-3">File Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{formatFileSize(file.file_size)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(file.upload_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{file.file_type}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Category */}
                {file.category && (
                  <>
                    <div>
                      <h3 className="font-semibold mb-3">Category</h3>
                      <Badge variant="outline">{file.category}</Badge>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Version Information */}
                {file.has_versions && (
                  <>
                    <div>
                      <h3 className="font-semibold mb-3">Version Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Current Version</span>
                          <Badge>v{file.current_version}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Total Versions</span>
                          <span className="text-sm">{file.version_count}</span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full"
                          onClick={() => onVersionHistory?.(file)}
                        >
                          <FileStack className="h-4 w-4 mr-2" />
                          View History
                        </Button>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Actions */}
                <div>
                  <h3 className="font-semibold mb-3">Actions</h3>
                  <div className="space-y-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => onDownload?.(file)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FilePreviewDrawer;
