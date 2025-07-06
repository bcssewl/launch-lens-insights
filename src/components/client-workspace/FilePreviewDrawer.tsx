import React, { useReducer, useState, useEffect, useCallback } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Calendar, 
  HardDrive, 
  Tag, 
  MessageCircle,
  Send,
  FileStack,
  ChevronDown,
  ChevronUp,
  Edit3,
  Check,
  X
} from 'lucide-react';
import { ClientFile } from '@/hooks/useClientFiles';
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
  isLoading: boolean;
  metadataCollapsed: boolean;
  editingFilename: boolean;
  tempFilename: string;
  chatHistory: ChatMessage[];
}

type FilePreviewAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_FILE_URL'; payload: string | null }
  | { type: 'TOGGLE_METADATA' }
  | { type: 'START_EDIT_FILENAME'; payload: string }
  | { type: 'CANCEL_EDIT_FILENAME' }
  | { type: 'UPDATE_TEMP_FILENAME'; payload: string }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'RESET' };

const initialState: FilePreviewState = {
  fileUrl: null,
  isLoading: false,
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
        chatHistory: [...state.chatHistory.slice(-4), action.payload]
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

  useEffect(() => {
    if (file && open) {
      loadFilePreview();
    } else {
      dispatch({ type: 'RESET' });
    }
  }, [file, open]);

  const loadFilePreview = async () => {
    if (!file) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      console.log('Loading file preview:', file.file_name, 'type:', file.file_type);
      const url = await getFileUrl(file.file_path);
      dispatch({ type: 'SET_FILE_URL', payload: url });
    } catch (error) {
      console.error('Error loading file preview:', error);
      dispatch({ type: 'SET_FILE_URL', payload: null });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleFilenameEdit = async () => {
    if (!file || !state.tempFilename.trim()) return;

    try {
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

  const renderFilePreview = () => {
    if (state.isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!state.fileUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <FileText className="h-12 w-12 mb-4" />
          <p>Preview not available</p>
          <p className="text-sm">Click download to view this file</p>
        </div>
      );
    }

    // Handle different file types with direct URLs
    if (file?.file_type.includes('image')) {
      return (
        <div className="flex justify-center">
          <img 
            src={state.fileUrl} 
            alt={file.file_name}
            className="max-w-full h-auto shadow-lg"
          />
        </div>
      );
    }

    if (file?.file_type.includes('pdf')) {
      return (
        <div className="w-full h-full">
          <div className="bg-muted/20 p-4 rounded-lg mb-4 text-center">
            <FileText className="h-12 w-12 mx-auto mb-2 text-red-500" />
            <p className="font-medium">{file.file_name}</p>
            <p className="text-sm text-muted-foreground mb-4">PDF Document</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => window.open(state.fileUrl, '_blank')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Open in New Tab
              </button>
            </div>
          </div>
        </div>
      );
    }

    // For other file types that can be displayed in iframe
    if (file?.file_type.includes('text') || file?.file_type.includes('json')) {
      return (
        <div className="w-full h-full">
          <iframe
            src={state.fileUrl}
            title={file.file_name}
            className="w-full h-full min-h-[400px] border-0 rounded-lg bg-white"
          />
        </div>
      );
    }

    // Fallback for other file types
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <FileText className="h-12 w-12 mb-4" />
        <p>Preview not available for this file type</p>
        <p className="text-sm">Click download to view this file</p>
      </div>
    );
  };

  if (!file) return null;

  const isCurrentVersion = file.current_version === file.current_version;

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
          <div className={`grid ${state.metadataCollapsed ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-[3fr_1fr]'} w-full h-full`}>
            
            <div className="flex flex-col min-w-0">
              <ScrollArea className="flex-1 p-4">
                {renderFilePreview()}
              </ScrollArea>

              <div className="p-4 border-t">
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

            {!state.metadataCollapsed && (
              <div className="border-l bg-muted/20 min-w-0">
                <ScrollArea className="h-full p-6">
                  <div className="space-y-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="lg:hidden w-full"
                      onClick={() => dispatch({ type: 'TOGGLE_METADATA' })}
                    >
                      <ChevronUp className="h-4 w-4 mr-2" />
                      Hide Details
                    </Button>

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

                    {file.category && (
                      <>
                        <div>
                          <h3 className="font-semibold mb-3">Category</h3>
                          <Badge variant="outline">{file.category}</Badge>
                        </div>
                        <Separator />
                      </>
                    )}

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

                    <div>
                      <h3 className="font-semibold mb-3">Actions</h3>
                      <div className="space-y-2">
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

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
