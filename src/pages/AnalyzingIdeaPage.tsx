
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import DashboardHeader from '@/components/DashboardHeader';
import { useReportStatus } from '@/hooks/useReportStatus';
import ReportSectionProgress from '@/components/ReportSectionProgress';
import { toast } from '@/hooks/use-toast';

const AnalyzingIdeaPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { reportId, validationId } = location.state || {};

  const { reportStatus, loading, error } = useReportStatus(reportId);

  useEffect(() => {
    if (!reportId || !validationId) {
      toast({
        title: "Invalid Request",
        description: "No report information found. Redirecting to dashboard.",
        variant: "destructive",
      });
      navigate('/dashboard');
      return;
    }
  }, [reportId, validationId, navigate]);

  useEffect(() => {
    if (reportStatus?.status === 'completed') {
      toast({
        title: "Analysis Complete!",
        description: "Your startup idea analysis is ready to view.",
      });
      navigate(`/results/${reportId}`);
    } else if (reportStatus?.status === 'failed') {
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your idea. Please try again.",
        variant: "destructive",
      });
    }
  }, [reportStatus?.status, navigate, reportId]);

  const handleRetry = () => {
    // In a real implementation, this would trigger the n8n workflow again
    toast({
      title: "Retrying Analysis",
      description: "Starting a new analysis of your idea...",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader>Analyzing Your Idea</DashboardHeader>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading analysis status...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader>Analysis Error</DashboardHeader>
        <div className="container mx-auto p-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-red-600">Error Loading Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                There was an error loading your analysis status: {error}
              </p>
              <div className="flex space-x-4">
                <Button onClick={() => navigate('/dashboard')} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
                <Button onClick={handleRetry}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader>Analyzing Your Idea</DashboardHeader>
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-primary">
                🔍 AI Analysis in Progress
              </CardTitle>
              <p className="text-muted-foreground">
                Our multi-agent AI system is analyzing your startup idea across multiple dimensions.
                This usually takes 2-5 minutes.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full">
                    <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">
                      Status: {reportStatus?.status?.charAt(0).toUpperCase() + reportStatus?.status?.slice(1)}
                    </span>
                  </div>
                </div>

                {reportStatus?.sections && (
                  <ReportSectionProgress sections={reportStatus.sections} />
                )}

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">What's happening now:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Market research agents are gathering industry data</li>
                    <li>• Competition analysis is identifying key competitors</li>
                    <li>• Financial models are calculating market opportunity</li>
                    <li>• SWOT analysis is evaluating strengths and risks</li>
                    <li>• Comprehensive scoring across multiple factors</li>
                  </ul>
                </div>

                <div className="flex justify-center">
                  <Button onClick={() => navigate('/dashboard')} variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyzingIdeaPage;
