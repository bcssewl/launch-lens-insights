import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useSaveReportAsPdf } from '@/hooks/useSaveReportAsPdf';
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
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const { saveReportAsPdf, isLoading } = useSaveReportAsPdf();
  const { toast } = useToast();

  // Set default filename when modal opens
  useEffect(() => {
    if (open && canvasTitle) {
      const cleanTitle = canvasTitle.replace(/[^a-zA-Z0-9\s]/g, '').trim();
      const defaultName = cleanTitle || 'Canvas Report';
      setFileName(`${defaultName}.pdf`);
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

    const result = await saveReportAsPdf({
      clientId: selectedClientId,
      fileName,
      canvasContent,
      canvasTitle
    });

    if (result.success && result.clientName) {
      onSaveSuccess(result.clientName);
      onClose();
    }
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