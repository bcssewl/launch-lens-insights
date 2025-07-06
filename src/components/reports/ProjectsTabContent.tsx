
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Building2, Plus, MoreVertical, FolderOpen, Upload, Archive, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ClientData {
  id: string;
  name: string;
  description: string | null;
  industry: string | null;
  potential: string | null;
  created_at: string;
  updated_at: string;
  report_count: number;
  initials: string;
  avatarColor: string;
  lastUpdated: string;
  progress: number;
  industryColor: string;
  potentialColor: string;
}

const ProjectsTabContent: React.FC = () => {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchClients = async () => {
    try {
      // Fetch clients with report counts
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select(`
          *,
          client_reports(count)
        `)
        .order('updated_at', { ascending: false });

      if (clientsError) throw clientsError;

      // Transform the data
      const transformedClients: ClientData[] = (clientsData || []).map((client: any) => {
        const reportCount = client.client_reports?.[0]?.count || 0;
        const initials = client.name
          .split(' ')
          .map((word: string) => word[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        // Generate avatar color based on name
        const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500', 'bg-indigo-500'];
        const avatarColor = colors[client.name.length % colors.length];

        // Calculate progress based on report count and recent activity
        const daysSinceUpdate = Math.floor((Date.now() - new Date(client.updated_at).getTime()) / (1000 * 60 * 60 * 24));
        const progress = Math.min(85, Math.max(10, reportCount * 20 - daysSinceUpdate * 2));

        // Determine colors for badges
        const industryColors = {
          'Technology': 'bg-blue-100 text-blue-700',
          'Healthcare': 'bg-green-100 text-green-700',
          'Finance': 'bg-purple-100 text-purple-700',
          'Automotive': 'bg-red-100 text-red-700',
          'Consumer Goods': 'bg-orange-100 text-orange-700',
          'FinTech': 'bg-indigo-100 text-indigo-700',
          'Hospitality': 'bg-yellow-100 text-yellow-700'
        };

        const potentialColors = {
          'High Potential': 'bg-green-100 text-green-700',
          'Medium Potential': 'bg-yellow-100 text-yellow-700',
          'Low Potential': 'bg-red-100 text-red-700'
        };

        return {
          id: client.id,
          name: client.name,
          description: client.description || `${client.industry || 'Business'} consulting and strategic analysis`,
          industry: client.industry,
          potential: client.potential || 'Medium Potential',
          created_at: client.created_at,
          updated_at: client.updated_at,
          report_count: reportCount,
          initials,
          avatarColor,
          lastUpdated: daysSinceUpdate === 0 ? 'Today' : `${daysSinceUpdate} days ago`,
          progress,
          industryColor: industryColors[client.industry as keyof typeof industryColors] || 'bg-gray-100 text-gray-700',
          potentialColor: potentialColors[client.potential as keyof typeof potentialColors] || 'bg-yellow-100 text-yellow-700'
        };
      });

      setClients(transformedClients);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Error",
        description: "Failed to fetch client data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleMenuAction = (action: string, clientName: string) => {
    console.log(`${action} for ${clientName}`);
    // Placeholder for future implementations
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Client Workspaces</h2>
            <p className="text-muted-foreground">Loading your consulting engagements...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="h-12 w-12 bg-muted rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-2/3 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-2 bg-muted rounded w-full"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Client Workspaces</h2>
          <p className="text-muted-foreground">Manage your consulting engagements and client deliverables</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Client
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clients.map((client) => (
          <div key={client.id} className="relative">
            <Link to={`/dashboard/client/${client.id}`}>
              <Card className="hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.02]">
                <CardHeader className="pb-3">
                  {/* Header with Avatar, Info, and Menu */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className={`${client.avatarColor} text-white font-semibold`}>
                          {client.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg leading-tight">{client.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">Updated {client.lastUpdated}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {client.report_count} reports
                        </p>
                      </div>
                    </div>
                    
                    {/* 3-dot menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleMenuAction('Open Workspace', client.name)}>
                          <FolderOpen className="mr-2 h-4 w-4" />
                          Open Workspace
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleMenuAction('Upload File', client.name)}>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload File
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleMenuAction('View Reports', client.name)}>
                          <FileText className="mr-2 h-4 w-4" />
                          View Reports
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleMenuAction('Archive Client', client.name)}>
                          <Archive className="mr-2 h-4 w-4" />
                          Archive Client
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Engagement Progress</span>
                      <span className="text-sm font-medium text-primary">{client.progress}%</span>
                    </div>
                    <Progress value={client.progress} className="h-2" />
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {client.description}
                  </p>

                  {/* Tags */}
                  <div className="flex gap-2 flex-wrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${client.potentialColor}`}>
                      {client.potential}
                    </span>
                    {client.industry && (
                      <span className={`px-2 py-1 text-xs rounded-full ${client.industryColor}`}>
                        {client.industry}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        ))}

        {/* Empty State Card */}
        <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="p-3 bg-muted rounded-lg mb-4">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">Add New Client</h3>
            <p className="text-sm text-muted-foreground text-center">
              Start a new consulting engagement
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectsTabContent;
