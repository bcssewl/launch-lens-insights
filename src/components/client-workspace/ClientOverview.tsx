
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { User, Mail, Calendar, FileText, Lightbulb, CheckSquare } from 'lucide-react';

interface ClientOverviewProps {
  client: {
    id: string;
    name: string;
    description: string | null;
    industry: string | null;
    potential: string | null;
    engagement_start: string | null;
    contact_person: string | null;
    contact_email: string | null;
    created_at: string;
    reportCount?: number;
    ideaCount?: number;
  };
}

const ClientOverview: React.FC<ClientOverviewProps> = ({ client }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysAgo = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const days = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
    return days === 0 ? 'Today' : `${days} days ago`;
  };

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
            <div className="text-lg font-semibold">{client.contact_person || 'Not specified'}</div>
            {client.contact_email && (
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <Mail className="h-3 w-3 mr-1" />
                {client.contact_email}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
            <CardTitle className="text-sm font-medium">Engagement Start</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {formatDate(client.engagement_start)}
            </div>
            <div className="text-sm text-muted-foreground">
              {getDaysAgo(client.engagement_start)}
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
                  : client.potential === 'Medium Potential'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-700'
              }
            >
              {client.potential || 'Not assessed'}
            </Badge>
            <div className="text-sm text-muted-foreground mt-1">{client.industry || 'Not specified'}</div>
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
            <div className="text-2xl font-bold">{client.reportCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Lightbulb className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Business Ideas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{client.ideaCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CheckSquare className="h-4 w-4 text-primary mr-2" />
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
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
            defaultValue={client.description || ''}
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
              <span className="text-muted-foreground">{getDaysAgo(client.created_at)}</span>
              <span>Client workspace created</span>
            </div>
            {client.engagement_start && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-muted-foreground">{getDaysAgo(client.engagement_start)}</span>
                <span>Engagement started</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientOverview;
