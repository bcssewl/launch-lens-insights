
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useClientFiles } from '@/hooks/useClientFiles';
import { Loader2, FileText, ChevronDown, Building2, ChevronRight, File } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProjectSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onAttach: (projectId: string, projectName: string, fileId?: string, fileName?: string) => void;
}

interface ClientData {
  id: string;
  name: string;
  description: string | null;
  industry: string | null;
  file_count: number;
}

interface SelectedFile {
  fileId: string;
  fileName: string;
  clientId: string;
  clientName: string;
}

const ProjectSelectionModal: React.FC<ProjectSelectionModalProps> = ({
  open,
  onClose,
  onAttach,
}) => {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [selectedFiles, setSelectedFiles] = useState<Map<string, SelectedFile>>(new Map());
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

  const toggleClientExpanded = (clientId: string) => {
    setExpandedClients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clientId)) {
        newSet.delete(clientId);
      } else {
        newSet.add(clientId);
      }
      return newSet;
    });
  };

  const handleFileToggle = (fileId: string, fileName: string, clientId: string, clientName: string) => {
    setSelectedFiles(prev => {
      const newMap = new Map(prev);
      const key = `${clientId}-${fileId}`;
      
      if (newMap.has(key)) {
        newMap.delete(key);
      } else {
        newMap.set(key, { fileId, fileName, clientId, clientName });
      }
      return newMap;
    });
  };

  const handleProjectToggle = (projectId: string) => {
    setSelectedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
        // Also remove any individual files from this client
        setSelectedFiles(prevFiles => {
          const newFileMap = new Map(prevFiles);
          for (const [key, file] of newFileMap) {
            if (file.clientId === projectId) {
              newFileMap.delete(key);
            }
          }
          return newFileMap;
        });
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const handleAttachSelected = () => {
    // Attach selected individual files
    selectedFiles.forEach(file => {
      onAttach(file.clientId, file.clientName, file.fileId, file.fileName);
    });

    // Attach selected entire projects (only if no individual files from that project are selected)
    selectedProjects.forEach(projectId => {
      const hasIndividualFiles = Array.from(selectedFiles.values()).some(file => file.clientId === projectId);
      if (!hasIndividualFiles) {
        const client = clients.find(c => c.id === projectId);
        if (client) {
          onAttach(projectId, client.name);
        }
      }
    });

    setSelectedFiles(new Map());
    setSelectedProjects(new Set());
    setExpandedClients(new Set());
    onClose();
  };

  const handleClose = () => {
    setSelectedFiles(new Map());
    setSelectedProjects(new Set());
    setExpandedClients(new Set());
    onClose();
  };

  const totalSelections = selectedFiles.size + Array.from(selectedProjects).filter(projectId => 
    !Array.from(selectedFiles.values()).some(file => file.clientId === projectId)
  ).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Projects and Files from Database</DialogTitle>
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
                  <ClientItem
                    key={client.id}
                    client={client}
                    isExpanded={expandedClients.has(client.id)}
                    isSelected={selectedProjects.has(client.id)}
                    selectedFiles={selectedFiles}
                    onToggleExpanded={() => toggleClientExpanded(client.id)}
                    onToggleProject={() => handleProjectToggle(client.id)}
                    onToggleFile={handleFileToggle}
                  />
                ))}
              </div>
              
              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAttachSelected}
                  disabled={totalSelections === 0}
                >
                  Attach Selected ({totalSelections})
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface ClientItemProps {
  client: ClientData;
  isExpanded: boolean;
  isSelected: boolean;
  selectedFiles: Map<string, SelectedFile>;
  onToggleExpanded: () => void;
  onToggleProject: () => void;
  onToggleFile: (fileId: string, fileName: string, clientId: string, clientName: string) => void;
}

const ClientItem: React.FC<ClientItemProps> = ({
  client,
  isExpanded,
  isSelected,
  selectedFiles,
  onToggleExpanded,
  onToggleProject,
  onToggleFile,
}) => {
  const { files, loading: filesLoading } = useClientFiles(isExpanded ? client.id : '');
  
  const clientFiles = Array.from(selectedFiles.values()).filter(file => file.clientId === client.id);
  const hasSelectedFiles = clientFiles.length > 0;

  return (
    <div className="border rounded-lg">
      <div className="flex items-center justify-between p-3 hover:bg-muted/50">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <Checkbox
            checked={isSelected}
            onChange={onToggleProject}
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={onToggleExpanded}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">
              {client.name}
              {hasSelectedFiles && (
                <span className="ml-2 text-xs text-primary">
                  ({clientFiles.length} files selected)
                </span>
              )}
            </h4>
            <p className="text-xs text-muted-foreground">
              {client.industry && `${client.industry} • `}
              {client.file_count} files
            </p>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t bg-muted/20">
          {filesLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Loading files...</span>
            </div>
          ) : files.length === 0 ? (
            <div className="py-4 px-6 text-center text-sm text-muted-foreground">
              No files found in this project
            </div>
          ) : (
            <div className="p-2 space-y-1 max-h-40 overflow-y-auto">
              {files.map(file => {
                const isFileSelected = selectedFiles.has(`${client.id}-${file.id}`);
                return (
                  <div
                    key={file.id}
                    className="flex items-center space-x-3 p-2 rounded hover:bg-background/50"
                  >
                    <Checkbox
                      checked={isFileSelected}
                      onChange={() => onToggleFile(file.id, file.file_name, client.id, client.name)}
                    />
                    <File className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{file.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {file.category} • {Math.round(file.file_size / 1024)} KB
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectSelectionModal;
