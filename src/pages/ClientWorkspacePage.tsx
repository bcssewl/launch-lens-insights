
import React, { useState } from 'react';
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

const tabItems = [
  { id: 'overview', title: 'Overview', icon: Home },
  { id: 'reports', title: 'AI Reports', icon: FileText },
  { id: 'files', title: 'File Vault', icon: Upload },
  { id: 'tasks', title: 'Tasks & Action Plans', icon: CheckSquare },
  { id: 'timeline', title: 'Timeline & Activity', icon: Clock },
];

// Mock client data
const mockClients = {
  'tesla': {
    id: 'tesla',
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
    id: 'drip-drinks',
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
    id: 'fintech-startup',
    name: 'FinTech Startup',
    description: 'Digital banking platform validation and market entry strategy',
    industry: 'FinTech',
    potential: 'Medium Potential',
    reportCount: 2,
    ideaCount: 3,
    engagementStart: '2024-03-10',
    contactPerson: 'Alex Rodriguez',
    contactEmail: 'alex@fintechstartup.com'
  },
  'local-restaurant': {
    id: 'local-restaurant',
    name: 'Local Restaurant Chain',
    description: 'Expansion strategy and operational efficiency optimization',
    industry: 'Hospitality',
    potential: 'Medium Potential',
    reportCount: 1,
    ideaCount: 2,
    engagementStart: '2024-04-05',
    contactPerson: 'Maria Garcia',
    contactEmail: 'maria@localrestaurant.com'
  }
};

const ClientWorkspacePage: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  
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
                  <p className="text-muted-foreground">{client.description}</p>
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
