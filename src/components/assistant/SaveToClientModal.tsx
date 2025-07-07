import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FolderOpen } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  industry?: string;
}

interface SaveToClientModalProps {
  open: boolean;
  onClose: () => void;
  canvasTitle: string;
  canvasContent: string;
  onSaveSuccess: (clientName: string) => void;
}

const SaveToClientModal: React.FC<SaveToClientModalProps> = ({
  open,
  onClose,
  canvasTitle,
  canvasContent,
  onSaveSuccess
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const { toast } = useToast();

  // Set default filename when modal opens
  useEffect(() => {
    if (open && canvasTitle) {
      const cleanTitle = canvasTitle.replace(/[^a-zA-Z0-9\s]/g, '').trim();
      const defaultName = cleanTitle || 'Canvas Report';
      setFileName(`${defaultName}.html`);
    }
  }, [open, canvasTitle]);

  // Load clients when modal opens
  useEffect(() => {
    if (open) {
      loadClients();
    }
  }, [open]);

  const loadClients = async () => {
    setIsLoadingClients(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, industry')
        .order('name');

      if (error) {
        console.error('Error loading clients:', error);
        toast({
          title: "Error",
          description: "Failed to load clients. Please try again.",
          variant: "destructive"
        });
        return;
      }

      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast({
        title: "Error",
        description: "Failed to load clients. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingClients(false);
    }
  };

  const handleSave = async () => {
    if (!selectedClientId || !fileName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a client and enter a filename.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to save files.",
          variant: "destructive"
        });
        return;
      }

      // Convert canvas content to HTML and upload to storage
      const { blob, contentType } = await generateHtmlBlob();
      const filePath = `${selectedClientId}/${Date.now()}_${fileName}`;
      
      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('client-files')
        .upload(filePath, blob, {
          contentType: contentType,
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast({
          title: "Upload Failed",
          description: "Failed to upload file. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Save file record to database
      const { error: dbError } = await supabase
        .from('client_files')
        .insert({
          client_id: selectedClientId,
          file_name: fileName,
          file_path: filePath,
          file_size: blob.size,
          file_type: contentType,
          category: 'Report',
          user_id: user.id
        });

      if (dbError) {
        console.error('Database error:', dbError);
        // Clean up uploaded file if database insert fails
        await supabase.storage.from('client-files').remove([filePath]);
        toast({
          title: "Save Failed",
          description: "Failed to save file record. Please try again.",
          variant: "destructive"
        });
        return;
      }

      const clientName = clients.find(c => c.id === selectedClientId)?.name || 'Unknown Client';
      toast({
        title: "Success",
        description: `Canvas report saved to ${clientName}'s workspace.`,
      });

      onSaveSuccess(clientName);
      onClose();
    } catch (error) {
      console.error('Error saving to client:', error);
      toast({
        title: "Error",
        description: "Failed to save canvas report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const preprocessCanvasContent = (rawContent: string): string => {
    // Try to parse as JSON first to extract actual content
    try {
      const parsed = JSON.parse(rawContent);
      
      // Look for common content fields in the JSON
      const contentFields = ['content', 'markdown', 'text', 'report', 'response', 'message'];
      
      for (const field of contentFields) {
        if (parsed[field] && typeof parsed[field] === 'string' && parsed[field].trim()) {
          console.log(`SaveToClientModal: Extracted content from JSON field: ${field}`);
          return parsed[field].trim();
        }
      }
      
      // If it's a valid JSON but no content field found, convert to readable string
      console.log('SaveToClientModal: JSON parsed but no content field found, using stringified version');
      return JSON.stringify(parsed, null, 2);
      
    } catch (error) {
      // Not valid JSON, treat as plain markdown/text
      console.log('SaveToClientModal: Content is not JSON, treating as markdown');
      return rawContent.trim();
    }
  };

  const generateHtmlBlob = async (): Promise<{ blob: Blob; fileExtension: string; contentType: string }> => {
    // Import PDF generation utilities
    const { processMarkdownForPdf, createChatGptPdfHtml } = await import('@/utils/canvasPdfProcessor');
    const { format } = await import('date-fns');
    
    // Preprocess the canvas content to extract meaningful text from JSON if needed
    const processedContent = preprocessCanvasContent(canvasContent);
    
    // Validate content length
    if (!processedContent || processedContent.length < 10) {
      throw new Error('Content is too short or empty to generate a meaningful report');
    }
    
    // Process markdown to HTML
    const processed = await processMarkdownForPdf(processedContent);
    const html = createChatGptPdfHtml(processed, {
      generatedDate: format(new Date(), 'd MMM yyyy'),
      author: 'AI Assistant'
    });
    
    // Return HTML blob with correct content type
    return {
      blob: new Blob([html], { type: 'text/html' }),
      fileExtension: '.html',
      contentType: 'text/html'
    };
  };

  const handleClose = () => {
    setSelectedClientId('');
    setFileName('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Save to Client Workspace
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client-select">Select Client</Label>
            {isLoadingClients ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Loading clients...</span>
              </div>
            ) : (
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a client workspace" />
                </SelectTrigger>
                <SelectContent>
                  {clients.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No clients found. Create a client first.
                    </div>
                  ) : (
                    clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        <div>
                          <div className="font-medium">{client.name}</div>
                          {client.industry && (
                            <div className="text-xs text-muted-foreground">{client.industry}</div>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="filename">File Name</Label>
            <Input
              id="filename"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter filename..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isLoading || !selectedClientId || !fileName.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save to Workspace'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SaveToClientModal;