
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, CheckSquare, MessageSquare, Calendar, User } from 'lucide-react';

interface ClientTimelineProps {
  client: {
    name: string;
  };
}

const mockActivities = [
  {
    id: 1,
    type: 'report',
    title: 'Market Expansion Analysis Report Generated',
    description: 'AI generated comprehensive market analysis for European expansion',
    timestamp: '2024-12-20T10:30:00',
    user: 'AI Agent',
    category: 'AI Report',
  },
  {
    id: 2,
    type: 'file',
    title: 'Financial Documents Uploaded',
    description: 'Tesla Q4 Financial Report.pdf uploaded to File Vault',
    timestamp: '2024-12-20T09:15:00',
    user: 'Sarah Johnson',
    category: 'File Upload',
  },
  {
    id: 3,
    type: 'task',
    title: 'Task Completed: Client Presentation',
    description: 'Prepared comprehensive Q1 strategy presentation',
    timestamp: '2024-12-19T16:45:00',
    user: 'John Consultant',
    category: 'Task',
  },
  {
    id: 4,
    type: 'meeting',
    title: 'Strategy Review Meeting',
    description: 'Quarterly strategy review with Tesla leadership team',
    timestamp: '2024-12-18T14:00:00',
    user: 'Meeting',
    category: 'Meeting',
  },
  {
    id: 5,
    type: 'report',
    title: 'Competitive Analysis Report Generated',
    description: 'AI analysis of competitive landscape in EV market',
    timestamp: '2024-12-18T11:20:00',
    user: 'AI Agent',
    category: 'AI Report',
  },
  {
    id: 6,
    type: 'file',
    title: 'Market Research Presentation Uploaded',
    description: 'Market Research Presentation.pptx added to workspace',
    timestamp: '2024-12-17T13:30:00',
    user: 'Mike Chen',
    category: 'File Upload',
  },
  {
    id: 7,
    type: 'task',
    title: 'New Task Created: Market Size Analysis',
    description: 'AI-generated task for European market analysis completion',
    timestamp: '2024-12-15T10:00:00',
    user: 'AI Agent',
    category: 'Task',
  },
  {
    id: 8,
    type: 'report',
    title: 'Financial Projections Report Generated',
    description: '5-year financial forecasting based on market data',
    timestamp: '2024-12-15T08:45:00',
    user: 'AI Agent',
    category: 'AI Report',
  },
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'report':
      return <FileText className="h-4 w-4 text-blue-500" />;
    case 'file':
      return <Upload className="h-4 w-4 text-green-500" />;
    case 'task':
      return <CheckSquare className="h-4 w-4 text-purple-500" />;
    case 'meeting':
      return <MessageSquare className="h-4 w-4 text-orange-500" />;
    default:
      return <Calendar className="h-4 w-4 text-gray-500" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'AI Report':
      return 'bg-blue-100 text-blue-700';
    case 'File Upload':
      return 'bg-green-100 text-green-700';
    case 'Task':
      return 'bg-purple-100 text-purple-700';
    case 'Meeting':
      return 'bg-orange-100 text-orange-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    return `${Math.floor(diffInHours)} hours ago`;
  } else if (diffInHours < 168) {
    return `${Math.floor(diffInHours / 24)} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};

const ClientTimeline: React.FC<ClientTimelineProps> = ({ client }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">Timeline & Activity Log</h2>
        <p className="text-muted-foreground">Complete history of all workspace activities</p>
      </div>

      {/* Activity Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {mockActivities.filter(a => a.type === 'report').length}
            </div>
            <div className="text-sm text-muted-foreground">Reports Generated</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-green-600">
              {mockActivities.filter(a => a.type === 'file').length}
            </div>
            <div className="text-sm text-muted-foreground">Files Uploaded</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {mockActivities.filter(a => a.type === 'task').length}
            </div>
            <div className="text-sm text-muted-foreground">Tasks Managed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {mockActivities.filter(a => a.type === 'meeting').length}
            </div>
            <div className="text-sm text-muted-foreground">Meetings</div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {mockActivities.map((activity, index) => (
              <div key={activity.id} className="relative">
                {/* Timeline line */}
                {index < mockActivities.length - 1 && (
                  <div className="absolute left-6 top-8 bottom-0 w-px bg-border"></div>
                )}
                
                {/* Activity item */}
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-background border-2 border-border rounded-full">
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{activity.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            {activity.user}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatTimestamp(activity.timestamp)}
                          </div>
                        </div>
                      </div>
                      <Badge className={getCategoryColor(activity.category)}>
                        {activity.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>This Week's Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Key Achievements</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• 2 new AI reports generated</li>
                <li>• 3 files uploaded to vault</li>
                <li>• 1 major task completed</li>
                <li>• Strategy meeting conducted</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Upcoming</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Market analysis due Dec 25</li>
                <li>• Client presentation prep</li>
                <li>• Quarterly review planning</li>
                <li>• Competitive analysis update</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientTimeline;
