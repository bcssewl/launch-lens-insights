
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Download, Eye, Calendar, Search } from 'lucide-react';

interface ClientReportsProps {
  client: {
    name: string;
    reportCount: number;
  };
}

const mockReports = [
  {
    id: 1,
    title: 'Market Expansion Analysis - European Market',
    type: 'Market Analysis',
    generatedDate: '2024-12-20',
    status: 'completed',
    score: 8.5,
  },
  {
    id: 2,
    title: 'Competitive Landscape Assessment',
    type: 'Competition Analysis',
    generatedDate: '2024-12-18',
    status: 'completed',
    score: 7.8,
  },
  {
    id: 3,
    title: 'Financial Projections & ROI Analysis',
    type: 'Financial Analysis',
    generatedDate: '2024-12-15',
    status: 'completed',
    score: 9.2,
  },
  {
    id: 4,
    title: 'Customer Segmentation Study',
    type: 'Market Research',
    generatedDate: '2024-12-12',
    status: 'in_progress',
    score: null,
  },
];

const ClientReports: React.FC<ClientReportsProps> = ({ client }) => {
  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">AI Generated Reports</h2>
          <p className="text-muted-foreground">{client.reportCount} reports generated</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search reports..." className="pl-10 w-64" />
          </div>
          <Button>Generate New Report</Button>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockReports.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                <Badge 
                  variant={report.status === 'completed' ? 'default' : 'secondary'}
                  className="ml-2"
                >
                  {report.status === 'completed' ? 'Completed' : 'In Progress'}
                </Badge>
              </div>
              <CardTitle className="text-lg leading-tight">{report.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {new Date(report.generatedDate).toLocaleDateString()}
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline">{report.type}</Badge>
                {report.score && (
                  <Badge className="bg-green-100 text-green-700">
                    Score: {report.score}/10
                  </Badge>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Download className="h-3 w-3 mr-1" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Report Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{client.reportCount}</div>
              <div className="text-sm text-muted-foreground">Total Reports</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">8.5</div>
              <div className="text-sm text-muted-foreground">Avg Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">3</div>
              <div className="text-sm text-muted-foreground">This Month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">12</div>
              <div className="text-sm text-muted-foreground">Downloads</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientReports;
