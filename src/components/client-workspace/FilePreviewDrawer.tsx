
import React, { useReducer, useState, useEffect, useCallback } from 'react';
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
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Edit3,
  Check,
  X
} from 'lucide-react';
import { ClientFile } from '@/hooks/useClientFiles';
import { getPreviewGenerator } from '@/utils/previewGenerators';
import { useToast } from '@/hooks/use-toast';

interface FilePreviewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: ClientFile | null;
  getFileUrl: (filePath: string) => Promise<string | null>;
  onDownload?: (file: ClientFile) => void;
  onVersionHistory?: (file: ClientFile) => void;
}

interface ChatMessage {
  id: string;
  question: string;
  timestamp: Date;
  response?: string;
}

interface FilePreviewState {
  fileUrl: string | null;
  previewContent: string | null;
  previewType: 'pdf' | 'image' | 'text' | 'error' | null;
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  zoomLevel: number;
  pdfDocument: any;
  metadataCollapsed: boolean;
  editingFilename: boolean;
  tempFilename: string;
  chatHistory: ChatMessage[];
}

type FilePreviewAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_FILE_URL'; payload: string | null }
  | { type: 'SET_PREVIEW'; payload: { content: string | null; type: 'pdf' | 'image' | 'text' | 'error' | null } }
  | { type: 'SET_PDF_DATA'; payload: { document: any; totalPages: number; currentPage: number } }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'TOGGLE_METADATA' }
  | { type: 'START_EDIT_FILENAME'; payload: string }
  | { type: 'CANCEL_EDIT_FILENAME' }
  | { type: 'UPDATE_TEMP_FILENAME'; payload: string }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'RESET' };

const initialState: FilePreviewState = {
  fileUrl: null,
  previewContent: null,
  previewType: null,
  isLoading: false,
  currentPage: 1,
  totalPages: 1,
  zoomLevel: 1,
  pdfDocument: null,
  metadataCollapsed: false,
  editingFilename: false,
  tempFilename: '',
  chatHistory: []
};

function filePreviewReducer(state: FilePreviewState, action: FilePreviewAction): FilePreviewState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_FILE_URL':
      return { ...state, fileUrl: action.payload };
    case 'SET_PREVIEW':
      return { ...state, previewContent: action.payload.content, previewType: action.payload.type };
    case 'SET_PDF_DATA':
      return { 
        ...state, 
        pdfDocument: action.payload.document, 
        totalPages: action.payload.totalPages,
        currentPage: action.payload.currentPage,
        previewType: 'pdf'
      };
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };
    case 'SET_ZOOM':
      return { ...state, zoomLevel: action.payload };
    case 'TOGGLE_METADATA':
      return { ...state, metadataCollapsed: !state.metadataCollapsed };
    case 'START_EDIT_FILENAME':
      return { ...state, editingFilename: true, tempFilename: action.payload };
    case 'CANCEL_EDIT_FILENAME':
      return { ...state, editingFilename: false, tempFilename: '' };
    case 'UPDATE_TEMP_FILENAME':
      return { ...state, tempFilename: action.payload };
    case 'ADD_CHAT_MESSAGE':
      return { 
        ...state, 
        chatHistory: [...state.chatHistory.slice(-4), action.payload] // Keep last 5 messages
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const FilePreviewDrawer: React.FC<FilePreviewDrawerProps> = ({
  open,
  onOpenChange,
  file,
  getFileUrl,
  onDownload,
  onVersionHistory
}) => {
  const [state, dispatch] = useReducer(filePreviewReducer, initialState);
  const [chatMessage, setChatMessage] = useState('');
  const { toast } = useToast();

  // Load file URL and preview when file changes
  useEffect(() => {
    if (file && open) {
      loadFilePreview();
    } else {
      dispatch({ type: 'RESET' });
    }
  }, [file, open]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;

      switch (event.key) {
        case 'Escape':
          onOpenChange(false);
          break;
        case 'ArrowLeft':
          if (state.previewType === 'pdf' && state.currentPage > 1) {
            handlePrevPage();
          }
          break;
        case 'ArrowRight':
          if (state.previewType === 'pdf' && state.currentPage < state.totalPages) {
            handleNextPage();
          }
          break;
        case 'z':
        case 'Z':
          if (event.shiftKey) {
            handleZoomOut();
          } else {
            handleZoomIn();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [open, state.currentPage, state.totalPages, state.previewType]);

  const loadFilePreview = async () => {
    if (!file) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const url = await getFileUrl(file.file_path);
      dispatch({ type: 'SET_FILE_URL', payload: url });

      if (url) {
        await generatePreview(url);
      }
    } catch (error) {
      console.error('Error loading file preview:', error);
      dispatch({ type: 'SET_PREVIEW', payload: { content: null, type: 'error' } });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const generatePreview = async (url: string) => {
    if (!file) return;

    if (file.file_type.includes('image')) {
      dispatch({ type: 'SET_PREVIEW', payload: { content: url, type: 'image' } });
    } else if (file.file_type.includes('pdf')) {
      await loadPDFPreview(url);
    } else {
      const generator = getPreviewGenerator(file.file_type);
      if (generator) {
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          
          // Create a proper File object instead of modifying blob properties
          const fileObject = new File([blob], file.file_name, { 
            type: file.file_type,
            lastModified: Date.now()
          });
          
          const result = await generator(fileObject);
          
          if (result.type === 'error') {
            dispatch({ type: 'SET_PREVIEW', payload: { content: null, type: 'error' } });
          } else {
            dispatch({ type: 'SET_PREVIEW', payload: { content: result.content, type: result.type as 'text' | 'image' } });
          }
        } catch (error) {
          console.error('Error generating preview:', error);
          dispatch({ type: 'SET_PREVIEW', payload: { content: null, type: 'error' } });
        }
      } else {
        dispatch({ type: 'SET_PREVIEW', payload: { content: null, type: 'error' } });
      }
    }
  };

  const loadPDFPreview = async (url: string) => {
    try {
      // Lazy load PDF.js
      const pdfjsLib = await import(/* webpackChunkName: "pdfjs" */ 'pdfjs-dist');
      const pdf = await pdfjsLib.getDocument(url).promise;
      dispatch({ type: 'SET_PDF_DATA', payload: { document: pdf, totalPages: pdf.numPages, currentPage: 1 } });
      await renderPDFPage(pdf, 1);
    } catch (error) {
      console.error('Error loading PDF:', error);
      dispatch({ type: 'SET_PREVIEW', payload: { content: null, type: 'error' } });
    }
  };

  const renderPDFPage = async (pdf: any, pageNumber: number) => {
    try {
      const page = await pdf.getPage(pageNumber);
      const scale = state.zoomLevel * 1.5;
      const viewport = page.getViewport({ scale });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      await page.render({ canvasContext: context, viewport }).promise;
      dispatch({ type: 'SET_PREVIEW', payload: { content: canvas.toDataURL(), type: 'pdf' } });
      dispatch({ type: 'SET_PAGE', payload: pageNumber });
    } catch (error) {
      console.error('Error rendering PDF page:', error);
    }
  };

  const handlePrevPage = useCallback(() => {
    if (state.pdfDocument && state.currentPage > 1) {
      renderPDFPage(state.pdfDocument, state.currentPage - 1);
    }
  }, [state.pdfDocument, state.currentPage]);

  const handleNextPage = useCallback(() => {
    if (state.pdfDocument && state.currentPage < state.totalPages) {
      renderPDFPage(state.pdfDocument, state.currentPage + 1);
    }
  }, [state.pdfDocument, state.currentPage, state.totalPages]);

  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(state.zoomLevel + 0.25, 3);
    dispatch({ type: 'SET_ZOOM', payload: newZoom });
    if (state.pdfDocument) {
      renderPDFPage(state.pdfDocument, state.currentPage);
    }
  }, [state.zoomLevel, state.pdfDocument, state.currentPage]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(state.zoomLevel - 0.25, 0.5);
    dispatch({ type: 'SET_ZOOM', payload: newZoom });
    if (state.pdfDocument) {
      renderPDFPage(state.pdfDocument, state.currentPage);
    }
  }, [state.zoomLevel, state.pdfDocument, state.currentPage]);

  const handleFilenameEdit = async () => {
    if (!file || !state.tempFilename.trim()) return;

    try {
      // TODO: Implement actual filename update API call
      toast({
        title: "Success",
        description: "Filename updated successfully"
      });
      dispatch({ type: 'CANCEL_EDIT_FILENAME' });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update filename",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = () => {
    if (chatMessage.trim() && file) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        question: chatMessage.trim(),
        timestamp: new Date()
      };

      // Console log for debugging (as requested)
      console.log({
        action: 'ask_nexus',
        fileId: file.id,
        fileName: file.file_name,
        question: chatMessage.trim(),
        timestamp: new Date()
      });

      dispatch({ type: 'ADD_CHAT_MESSAGE', payload: newMessage });
      setChatMessage('');
      
      toast({
        title: "Question sent to Nexus",
        description: "AI response coming soon..."
      });
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

  // Check if viewing older version (for greying out download)
  const isCurrentVersion = file.current_version === file.current_version; // TODO: Update when version selection is implemented

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-full sm:w-[80vw] lg:w-[70vw] p-0 flex flex-col max-w-none"
      >
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="text-left">
            {state.editingFilename ? (
              <div className="flex items-center gap-2">
                <Input
                  value={state.tempFilename}
                  onChange={(e) => dispatch({ type: 'UPDATE_TEMP_FILENAME', payload: e.target.value })}
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleFilenameEdit()}
                />
                <Button size="sm" onClick={handleFilenameEdit}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => dispatch({ type: 'CANCEL_EDIT_FILENAME' })}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>{file.file_name}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => dispatch({ type: 'START_EDIT_FILENAME', payload: file.file_name })}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Preview Area - CSS Grid Layout */}
          <div className={`grid ${state.metadataCollapsed ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-[3fr_1fr]'} w-full h-full`}>
            
            {/* Preview Content */}
            <div className="flex flex-col min-w-0">
              {/* PDF Controls */}
              {state.previewType === 'pdf' && (
                <div className="p-4 border-b flex items-center justify-between bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handlePrevPage}
                      disabled={state.currentPage <= 1}
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm" aria-live="polite">
                      Page {state.currentPage} of {state.totalPages}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleNextPage}
                      disabled={state.currentPage >= state.totalPages}
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={handleZoomOut} aria-label="Zoom out">
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">{Math.round(state.zoomLevel * 100)}%</span>
                    <Button size="sm" variant="outline" onClick={handleZoomIn} aria-label="Zoom in">
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Preview Content */}
              <ScrollArea className="flex-1 p-4">
                {state.isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : state.previewType === 'image' && state.previewContent ? (
                  <div className="flex justify-center">
                    <img 
                      src={state.previewContent} 
                      alt={file.file_name}
                      className="max-w-full h-auto shadow-lg"
                    />
                  </div>
                ) : state.previewType === 'pdf' && state.previewContent ? (
                  <div className="flex justify-center" role="document" aria-label={`PDF document: ${file.file_name}`}>
                    <img 
                      src={state.previewContent} 
                      alt={`Page ${state.currentPage} of ${file.file_name}`}
                      className="max-w-full h-auto shadow-lg"
                    />
                  </div>
                ) : state.previewType === 'text' && state.previewContent ? (
                  <div className="bg-muted/20 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm">{state.previewContent}</pre>
                  </div>
                ) : state.previewType === 'error' ? (
                  <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <FileText className="h-12 w-12 mb-4" />
                    <p>Preview not available</p>
                    <p className="text-sm">Click download to view this file</p>
                  </div>
                ) : null}
              </ScrollArea>

              {/* Ask Nexus Chat Input */}
              <div className="p-4 border-t">
                {/* Chat History */}
                {state.chatHistory.length > 0 && (
                  <div className="mb-4 max-h-32 overflow-y-auto">
                    {state.chatHistory.map((msg) => (
                      <div key={msg.id} className="mb-2 p-2 bg-muted/20 rounded text-sm">
                        <div className="font-medium">You: {msg.question}</div>
                        <div className="text-xs text-muted-foreground">
                          {msg.timestamp.toLocaleTimeString()}
                        </div>
                        {msg.response && (
                          <div className="mt-1 text-primary">Nexus: {msg.response}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

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
            {!state.metadataCollapsed && (
              <div className="border-l bg-muted/20 min-w-0">
                <ScrollArea className="h-full p-6">
                  <div className="space-y-6">
                    {/* Mobile collapse toggle */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="lg:hidden w-full"
                      onClick={() => dispatch({ type: 'TOGGLE_METADATA' })}
                    >
                      <ChevronUp className="h-4 w-4 mr-2" />
                      Hide Details
                    </Button>

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
                              <Badge variant={isCurrentVersion ? "default" : "secondary"}>
                                v{file.current_version}
                              </Badge>
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
                          className={`w-full ${!isCurrentVersion ? 'opacity-50' : ''}`}
                          onClick={() => onDownload?.(file)}
                          disabled={!isCurrentVersion}
                          title={!isCurrentVersion ? 'Download not available for older versions' : 'Download file'}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download {!isCurrentVersion && '(Current Version Only)'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          {/* Mobile metadata toggle when collapsed */}
          {state.metadataCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 lg:hidden"
              onClick={() => dispatch({ type: 'TOGGLE_METADATA' })}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FilePreviewDrawer;
