
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Download, Eye, Calendar, Search, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface ClientReportsProps {
  client: {
    name: string;
    reportCount?: number;
    id: string;
  };
}

interface AssignedReport {
  id: string;
  validation_id: string;
  status: string;
  overall_score: number | null;
  completed_at: string | null;
  created_at: string;
  assigned_at: string;
  idea_name: string;
  one_line_description: string;
  recommendation: string | null;
}

const ClientReports: React.FC<ClientReportsProps> = ({ client }) => {
  const [reports, setReports] = useState<AssignedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const fetchClientReports = async () => {
    try {
      const { data, error } = await supabase
        .from('client_reports')
        .select(`
          assigned_at,
          validation_reports!inner (
            id,
            validation_id,
            status,
            overall_score,
            completed_at,
            created_at,
            recommendation,
            idea_validations!inner (
              idea_name,
              one_line_description
            )
          )
        `)
        .eq('client_id', client.id)
        .order('assigned_at', { ascending: false });

      if (error) throw error;

      const formattedReports: AssignedReport[] = (data || []).map((item: any) => ({
        id: item.validation_reports.id,
        validation_id: item.validation_reports.validation_id,
        status: item.validation_reports.status,
        overall_score: item.validation_reports.overall_score,
        completed_at: item.validation_reports.completed_at,
        created_at: item.validation_reports.created_at,
        assigned_at: item.assigned_at,
        idea_name: item.validation_reports.idea_validations.idea_name,
        one_line_description: item.validation_reports.idea_validations.one_line_description,
        recommendation: item.validation_reports.recommendation
      }));

      setReports(formattedReports);
    } catch (error) {
      console.error('Error fetching client reports:', error);
      toast({
        title: "Error",
        description: "Failed to fetch client reports",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientReports();
  }, [client.id]);

  const filteredReports = reports.filter(report =>
    report.idea_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.one_line_description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
      case 'generating':
        return <Badge variant="secondary">Generating</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getScoreBadge = (score: number | null) => {
    if (!score) return null;
    
    let colorClass = "bg-gray-100 text-gray-700";
    if (score >= 8) colorClass = "bg-green-100 text-green-700";
    else if (score >= 6) colorClass = "bg-blue-100 text-blue-700";
    else if (score >= 4) colorClass = "bg-yellow-100 text-yellow-700";
    else colorClass = "bg-red-100 text-red-700";

    return (
      <Badge className={colorClass}>
        <Star className="h-3 w-3 mr-1" />
        {score}/10
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">AI Generated Reports</h2>
            <p className="text-muted-foreground">Loading reports...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-3 bg-muted rounded w-full"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">AI Generated Reports</h2>
          <p className="text-muted-foreground">{reports.length} reports assigned to this client</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search reports..." 
              className="pl-10 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      {filteredReports.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredReports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  {getStatusBadge(report.status)}
                </div>
                <CardTitle className="text-lg leading-tight">{report.idea_name}</CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {report.one_line_description}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Assigned: {new Date(report.assigned_at).toLocaleDateString()}
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  {getScoreBadge(report.overall_score)}
                  {report.recommendation && (
                    <Badge variant="outline" className="text-xs">
                      {report.recommendation}
                    </Badge>
                  )}
                </div>

                {report.status === 'completed' && (
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1" asChild>
                      <Link to={`/results/${report.id}`}>
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Download className="h-3 w-3 mr-1" />
                      Export
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No Reports Assigned</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              {searchTerm 
                ? "No reports match your search criteria" 
                : "No AI reports have been assigned to this client yet"
              }
            </p>
            {!searchTerm && (
              <Button asChild>
                <Link to="/dashboard/validate">
                  Generate New Report
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Report Analytics */}
      {reports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Report Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{reports.length}</div>
                <div className="text-sm text-muted-foreground">Total Reports</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {reports.filter(r => r.overall_score && r.overall_score >= 7).length}
                </div>
                <div className="text-sm text-muted-foreground">High Scoring</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {reports.filter(r => r.status === 'completed').length}
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {reports.filter(r => 
                    new Date(r.assigned_at) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                  ).length}
                </div>
                <div className="text-sm text-muted-foreground">This Month</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientReports;
