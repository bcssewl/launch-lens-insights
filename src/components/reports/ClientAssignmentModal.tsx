
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, FileText, Calendar, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Report {
  id: string;
  idea_name: string;
  overall_score: number | null;
  completed_at: string;
  one_line_description: string;
}

interface Client {
  id: string;
  name: string;
  industry: string | null;
  potential: string | null;
}

interface ClientAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: Report | null;
  clients: Client[];
  onAssignToClient: (reportId: string, clientId: string) => Promise<void>;
  onCreateClient: (clientData: { name: string; industry: string; description: string }) => Promise<string>;
  onSkip: () => void;
}

const ClientAssignmentModal: React.FC<ClientAssignmentModalProps> = ({
  open,
  onOpenChange,
  report,
  clients,
  onAssignToClient,
  onCreateClient,
  onSkip
}) => {
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: '',
    industry: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAssign = async () => {
    if (!report || !selectedClient) return;

    setLoading(true);
    try {
      await onAssignToClient(report.id, selectedClient);
      toast({
        title: "Report Assigned",
        description: `Report successfully assigned to ${clients.find(c => c.id === selectedClient)?.name}`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Assignment Failed",
        description: "Failed to assign report to client",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAndAssign = async () => {
    if (!report || !newClientData.name) return;

    setLoading(true);
    try {
      const clientId = await onCreateClient(newClientData);
      await onAssignToClient(report.id, clientId);
      toast({
        title: "Client Created & Report Assigned",
        description: `Created "${newClientData.name}" and assigned the report`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Failed to Create Client",
        description: "Could not create client or assign report",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onSkip();
    onOpenChange(false);
  };

  if (!report) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Assign Report to Client
          </DialogTitle>
        </DialogHeader>

        {/* Report Summary */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{report.idea_name}</h4>
                <p className="text-sm text-muted-foreground mt-1">{report.one_line_description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(report.completed_at).toLocaleDateString()}
                  </div>
                  {report.overall_score && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="text-sm font-medium">{report.overall_score}/10</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {!showCreateForm ? (
            <>
              {/* Client Selection */}
              <div>
                <Label htmlFor="client-select">Select Client</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger id="client-select">
                    <SelectValue placeholder="Choose a client workspace..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{client.name}</span>
                          {client.industry && (
                            <Badge variant="outline" className="text-xs">
                              {client.industry}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={handleAssign} 
                  disabled={!selectedClient || loading}
                  className="w-full"
                >
                  {loading ? "Assigning..." : "Assign to Client"}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateForm(true)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Client
                </Button>
                
                <Button 
                  variant="ghost" 
                  onClick={handleSkip}
                  className="w-full"
                >
                  Skip for Now
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Create Client Form */}
              <div className="space-y-3">
                <div>
                  <Label htmlFor="client-name">Client Name *</Label>
                  <Input
                    id="client-name"
                    value={newClientData.name}
                    onChange={(e) => setNewClientData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter client name..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="client-industry">Industry</Label>
                  <Input
                    id="client-industry"
                    value={newClientData.industry}
                    onChange={(e) => setNewClientData(prev => ({ ...prev, industry: e.target.value }))}
                    placeholder="e.g., Technology, Healthcare..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="client-description">Description</Label>
                  <Input
                    id="client-description"
                    value={newClientData.description}
                    onChange={(e) => setNewClientData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the client..."
                  />
                </div>
              </div>

              {/* Create Form Actions */}
              <div className="flex gap-2">
                <Button 
                  onClick={handleCreateAndAssign}
                  disabled={!newClientData.name || loading}
                  className="flex-1"
                >
                  {loading ? "Creating..." : "Create & Assign"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1"
                >
                  Back
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientAssignmentModal;
