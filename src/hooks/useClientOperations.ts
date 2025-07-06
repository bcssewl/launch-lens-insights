
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Client {
  id: string;
  name: string;
  industry: string | null;
  potential: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface CreateClientData {
  name: string;
  industry: string;
  description: string;
}

export const useClientOperations = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchClients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Error",
        description: "Failed to fetch clients",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (clientData: CreateClientData): Promise<string> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const clientId = clientData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      const { data, error } = await supabase
        .from('clients')
        .insert({
          id: clientId,
          name: clientData.name,
          industry: clientData.industry || null,
          description: clientData.description || null,
          user_id: user.id,
          potential: 'Medium Potential' // Default value
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      if (data) {
        setClients(prev => [data, ...prev]);
      }
      
      return clientId;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  };

  const assignReportToClient = async (reportId: string, clientId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Update the validation report with client_id
      const { error: reportError } = await supabase
        .from('validation_reports')
        .update({ client_id: clientId })
        .eq('id', reportId);

      if (reportError) throw reportError;

      // Also create entry in client_reports junction table
      const { error: junctionError } = await supabase
        .from('client_reports')
        .insert({
          client_id: clientId,
          report_id: reportId,
          assigned_by: user.id
        });

      if (junctionError) throw junctionError;
    } catch (error) {
      console.error('Error assigning report to client:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return {
    clients,
    loading,
    fetchClients,
    createClient,
    assignReportToClient
  };
};
