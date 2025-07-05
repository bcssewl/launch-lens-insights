
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Building2, FileText, Upload, CheckSquare, Clock, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ClientOverview from '@/components/client-workspace/ClientOverview';
import ClientReports from '@/components/client-workspace/ClientReports';
import ClientFileVault from '@/components/client-workspace/ClientFileVault';
import ClientTasks from '@/components/client-workspace/ClientTasks';
import ClientTimeline from '@/components/client-workspace/ClientTimeline';
import { Link } from 'react-router-dom';

const sectionItems = [
  { id: 'overview', title: 'Overview', icon: Home },
  { id: 'reports', title: 'AI Reports', icon: FileText },
  { id: 'files', title: 'File Vault', icon: Upload },
  { id: 'tasks', title: 'Tasks & Action Plans', icon: CheckSquare },
  { id: 'timeline', title: 'Timeline & Activity', icon: Clock },
];

// Mock client data
const mockClients = {
  'tesla': {
    name: 'Tesla',
    description: 'Electric vehicle strategy and market expansion consulting',
    industry: 'Automotive',
    potential: 'High Potential',
    reportCount: 4,
    ideaCount: 6,
    engagementStart: '2024-01-15',
    contactPerson: 'Sarah Johnson',
    contactEmail: 'sarah.johnson@tesla.com'
  },
  'drip-drinks': {
    name: 'Drip Drinks',
    description: 'Beverage brand positioning and growth strategy development',
    industry: 'Consumer Goods',
    potential: 'High Potential',
    reportCount: 3,
    ideaCount: 4,
    engagementStart: '2024-02-01',
    contactPerson: 'Mike Chen',
    contactEmail: 'mike.chen@dripdrinks.com'
  },
  'fintech-startup': {
    name: 'FinTech Startup',
    description: 'Digital banking platform validation and market entry strategy',
    industry: 'FinTech',
    potential: 'Medium Potential',
    reportCount: 2,
    ideaCount: 3,
    engagementStart: '2024-03-10',
    contactPerson: 'Alex Rodriguez',
    contactEmail: 'alex@fintechstartup.com'
  }
};

const ClientWorkspacePage: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [activeSection, setActiveSection] = useState('overview');
  
  const client = clientId ? mockClients[clientId as keyof typeof mockClients] : null;

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

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <ClientOverview client={client} />;
      case 'reports':
        return <ClientReports client={client} />;
      case 'files':
        return <ClientFileVault client={client} />;
      case 'tasks':
        return <ClientTasks client={client} />;
      case 'timeline':
        return <ClientTimeline client={client} />;
      default:
        return <ClientOverview client={client} />;
    }
  };

  return (
    <DashboardLayout>
      <div className="apple-hero">
        <SidebarProvider>
          <div className="flex h-full w-full">
            <Sidebar className="w-64 border-r border-border-subtle">
              <SidebarContent className="p-4">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-lg">{client.name}</h2>
                      <p className="text-sm text-muted-foreground">{client.industry}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link to="/dashboard/projects">← Back to Clients</Link>
                  </Button>
                </div>
                
                <SidebarMenu>
                  {sectionItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={activeSection === item.id}
                        onClick={() => setActiveSection(item.id)}
                        className="w-full justify-start"
                      >
                        <item.icon className="h-4 w-4 mr-2" />
                        {item.title}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarContent>
            </Sidebar>
            
            <SidebarInset className="flex-1">
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold">{sectionItems.find(item => item.id === activeSection)?.title}</h1>
                      <p className="text-muted-foreground">{client.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="max-w-7xl">
                  {renderSection()}
                </div>
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    </DashboardLayout>
  );
};

export default ClientWorkspacePage;
