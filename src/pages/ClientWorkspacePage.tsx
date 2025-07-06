import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, FileText, Upload, CheckSquare, Clock, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ClientOverview from '@/components/client-workspace/ClientOverview';
import ClientReports from '@/components/client-workspace/ClientReports';
import ClientFileVault from '@/components/client-workspace/ClientFileVault';
import ClientTasks from '@/components/client-workspace/ClientTasks';
import ClientTimeline from '@/components/client-workspace/ClientTimeline';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const tabItems = [
  { id: 'overview', title: 'Overview', icon: Home },
  { id: 'reports', title: 'AI Reports', icon: FileText },
  { id: 'files', title: 'File Vault', icon: Upload },
  { id: 'tasks', title: 'Tasks & Action Plans', icon: CheckSquare },
  { id: 'timeline', title: 'Timeline & Activity', icon: Clock },
];

interface Client {
  id: string;
  name: string;
  description: string | null;
  industry: string | null;
  potential: string | null;
  engagement_start: string | null;
  contact_person: string | null;
  contact_email: string | null;
  created_at: string;
  updated_at: string;
  reportCount?: number;
  ideaCount?: number;
}

const ClientWorkspacePage: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchClient = async () => {
      if (!clientId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', clientId)
          .single();

        if (error) {
          console.error('Error fetching client:', error);
          toast({
            title: "Error",
            description: "Failed to fetch client data",
            variant: "destructive"
          });
          return;
        }

        if (data) {
          setClient({
            ...data,
            reportCount: 0, // TODO: Fetch actual report count
            ideaCount: 0 // TODO: Fetch actual idea count
          });
        }
      } catch (error) {
        console.error('Error fetching client:', error);
        toast({
          title: "Error",
          description: "Failed to fetch client data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [clientId, toast]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Card className="p-8 text-center">
            <CardContent>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading client workspace...</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!client) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Card className="p-8 text-center">
            <CardContent>
              <h2 className="text-xl font-semibold mb-4">Client Not Found</h2>
              <p className="text-muted-foreground mb-4">The requested client workspace could not be found.</p>
              <Button asChild>
                <Link to="/dashboard/projects">Back to Clients</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="apple-hero p-6">
        {/* Client Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{client.name}</h1>
                  <p className="text-muted-foreground">{client.description || `${client.industry || 'Business'} consulting engagement`}</p>
                </div>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link to="/dashboard/projects">← Back to Clients</Link>
            </Button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            {tabItems.map((item) => (
              <TabsTrigger key={item.id} value={item.id} className="flex items-center gap-2">
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="max-w-7xl">
            <TabsContent value="overview" className="mt-0">
              <ClientOverview client={client} />
            </TabsContent>
            
            <TabsContent value="reports" className="mt-0">
              <ClientReports client={client} />
            </TabsContent>
            
            <TabsContent value="files" className="mt-0">
              <ClientFileVault client={client} />
            </TabsContent>
            
            <TabsContent value="tasks" className="mt-0">
              <ClientTasks client={client} />
            </TabsContent>
            
            <TabsContent value="timeline" className="mt-0">
              <ClientTimeline client={client} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ClientWorkspacePage;
