import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSaveReportAsPdf } from '@/hooks/useSaveReportAsPdf';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FolderOpen } from 'lucide-react';
import { useClients } from './useClients';
import ClientSelector from './ClientSelector';
import FilenameInput from './FilenameInput';
import { SaveToClientModalProps } from './types';

const SaveToClientModal: React.FC<SaveToClientModalProps> = ({
  open,
  onClose,
  canvasTitle,
  canvasContent,
  onSaveSuccess
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [fileName, setFileName] = useState('');
  const { clients, isLoadingClients } = useClients(open);
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
          <ClientSelector
            clients={clients}
            isLoadingClients={isLoadingClients}
            selectedClientId={selectedClientId}
            onClientChange={setSelectedClientId}
          />

          <FilenameInput
            fileName={fileName}
            onFileNameChange={setFileName}
          />

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