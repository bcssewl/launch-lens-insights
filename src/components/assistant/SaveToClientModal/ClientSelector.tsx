import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { Client } from './types';

interface ClientSelectorProps {
  clients: Client[];
  isLoadingClients: boolean;
  selectedClientId: string;
  onClientChange: (clientId: string) => void;
}

const ClientSelector: React.FC<ClientSelectorProps> = ({
  clients,
  isLoadingClients,
  selectedClientId,
  onClientChange
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="client-select">Select Client</Label>
      {isLoadingClients ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="ml-2 text-sm text-muted-foreground">Loading clients...</span>
        </div>
      ) : (
        <Select value={selectedClientId} onValueChange={onClientChange}>
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
  );
};

export default ClientSelector;