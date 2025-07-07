
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useClientFiles } from '@/hooks/useClientFiles';
import { Loader2, FileText, ChevronDown, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProjectSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onAttach: (projectId: string, projectName: string) => void;
}

interface ClientData {
  id: string;
  name: string;
  description: string | null;
  industry: string | null;
  file_count: number;
}

const ProjectSelectionModal: React.FC<ProjectSelectionModalProps> = ({
  open,
  onClose,
  onAttach,
}) => {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  React.useEffect(() => {
    if (open) {
      fetchClients();
    }
  }, [open]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const { data: clientsData, error } = await supabase
        .from('clients')
        .select(`
          id,
          name,
          description,
          industry,
          client_files(count)
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const transformedClients: ClientData[] = (clientsData || []).map((client: any) => ({
        id: client.id,
        name: client.name,
        description: client.description,
        industry: client.industry,
        file_count: client.client_files?.[0]?.count || 0,
      }));

      setClients(transformedClients);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Error",
        description: "Failed to fetch client projects",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProjectToggle = (projectId: string) => {
    setSelectedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const handleFileTypeSelect = (projectId: string) => {
    // Select the project when a file type is chosen
    setSelectedProjects(prev => {
      const newSet = new Set(prev);
      newSet.add(projectId);
      return newSet;
    });
  };

  const handleAttachSelected = () => {
    selectedProjects.forEach(projectId => {
      const client = clients.find(c => c.id === projectId);
      if (client) {
        onAttach(projectId, client.name);
      }
    });
    setSelectedProjects(new Set());
    onClose();
  };

  const handleClose = () => {
    setSelectedProjects(new Set());
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Projects from Database</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading projects...</span>
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No client projects found</p>
              <p className="text-sm">Visit the Projects page to create your first client project.</p>
            </div>
          ) : (
            <>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {clients.map(client => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <Checkbox
                        checked={selectedProjects.has(client.id)}
                        onChange={() => handleProjectToggle(client.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {client.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {client.industry && `${client.industry} • `}
                          {client.file_count} files
                        </p>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem 
                          onClick={() => handleFileTypeSelect(client.id)}
                          className="cursor-pointer"
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Client Files
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAttachSelected}
                  disabled={selectedProjects.size === 0}
                >
                  Attach Selected ({selectedProjects.size})
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectSelectionModal;
