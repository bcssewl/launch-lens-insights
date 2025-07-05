
import React from 'react';
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

// Enhanced client data with new fields
const clientsData = [
  {
    id: 'tesla',
    name: 'Tesla',
    description: 'Electric vehicle strategy and market expansion consulting',
    industry: 'Automotive',
    potential: 'High Potential',
    potentialColor: 'bg-green-100 text-green-700',
    industryColor: 'bg-blue-100 text-blue-700',
    reportCount: 4,
    ideaCount: 6,
    initials: 'T',
    avatarColor: 'bg-blue-500',
    lastUpdated: '2 days ago',
    progress: 85,
  },
  {
    id: 'drip-drinks',
    name: 'Drip Drinks',
    description: 'Beverage brand positioning and growth strategy development',
    industry: 'Consumer Goods',
    potential: 'High Potential',
    potentialColor: 'bg-green-100 text-green-700',
    industryColor: 'bg-purple-100 text-purple-700',
    reportCount: 3,
    ideaCount: 4,
    initials: 'DD',
    avatarColor: 'bg-purple-500',
    lastUpdated: '5 days ago',
    progress: 70,
  },
  {
    id: 'fintech-startup',
    name: 'FinTech Startup',
    description: 'Digital banking platform validation and market entry strategy',
    industry: 'FinTech',
    potential: 'Medium Potential',
    potentialColor: 'bg-yellow-100 text-yellow-700',
    industryColor: 'bg-green-100 text-green-700',
    reportCount: 2,
    ideaCount: 3,
    initials: 'FS',
    avatarColor: 'bg-green-500',
    lastUpdated: '1 week ago',
    progress: 45,
  },
  {
    id: 'local-restaurant',
    name: 'Local Restaurant Chain',
    description: 'Expansion strategy and operational efficiency optimization',
    industry: 'Hospitality',
    potential: 'Medium Potential',
    potentialColor: 'bg-yellow-100 text-yellow-700',
    industryColor: 'bg-orange-100 text-orange-700',
    reportCount: 1,
    ideaCount: 2,
    initials: 'LR',
    avatarColor: 'bg-orange-500',
    lastUpdated: '3 days ago',
    progress: 25,
  },
];

const ProjectsTabContent: React.FC = () => {
  const handleMenuAction = (action: string, clientName: string) => {
    console.log(`${action} for ${clientName}`);
    // Placeholder for future implementations
  };

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
        {clientsData.map((client) => (
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
                          {client.reportCount} reports • {client.ideaCount} ideas
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
                    <span className={`px-2 py-1 text-xs rounded-full ${client.industryColor}`}>
                      {client.industry}
                    </span>
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
