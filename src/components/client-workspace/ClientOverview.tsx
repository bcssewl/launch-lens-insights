
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { User, Mail, Calendar, FileText, Lightbulb, CheckSquare } from 'lucide-react';

interface ClientOverviewProps {
  client: {
    name: string;
    description: string;
    industry: string;
    potential: string;
    reportCount: number;
    ideaCount: number;
    engagementStart: string;
    contactPerson: string;
    contactEmail: string;
  };
}

const ClientOverview: React.FC<ClientOverviewProps> = ({ client }) => {
  return (
    <div className="space-y-6">
      {/* Client Info Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <User className="h-4 w-4 text-muted-foreground mr-2" />
            <CardTitle className="text-sm font-medium">Contact Person</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{client.contactPerson}</div>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Mail className="h-3 w-3 mr-1" />
              {client.contactEmail}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
            <CardTitle className="text-sm font-medium">Engagement Start</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {new Date(client.engagementStart).toLocaleDateString()}
            </div>
            <div className="text-sm text-muted-foreground">
              {Math.floor((new Date().getTime() - new Date(client.engagementStart).getTime()) / (1000 * 60 * 60 * 24))} days ago
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge 
              className={
                client.potential === 'High Potential' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }
            >
              {client.potential}
            </Badge>
            <div className="text-sm text-muted-foreground mt-1">{client.industry}</div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <FileText className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">AI Reports Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{client.reportCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Lightbulb className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Business Ideas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{client.ideaCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CheckSquare className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea 
            placeholder="Add notes about this client engagement..."
            className="min-h-32"
            defaultValue="Initial consultation completed. Focus on market expansion strategy for electric vehicle segment. Client is particularly interested in European market penetration."
          />
          <Button>Save Notes</Button>
        </CardContent>
      </Card>

      {/* Recent Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-muted-foreground">2 hours ago</span>
              <span>New market analysis report generated</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-muted-foreground">1 day ago</span>
              <span>Financial projections uploaded</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-muted-foreground">3 days ago</span>
              <span>Task "Competitive analysis" completed</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientOverview;
