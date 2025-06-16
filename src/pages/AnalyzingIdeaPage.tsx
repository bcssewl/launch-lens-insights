
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import DashboardHeader from '@/components/DashboardHeader';
import { useReportStatus } from '@/hooks/useReportStatus';
import EnhancedAnalysisLoader from '@/components/analysis/EnhancedAnalysisLoader';
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
    toast({
      title: "Retrying Analysis",
      description: "Starting a new analysis of your idea...",
    });
    navigate('/dashboard/validate');
  };

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
        <DashboardHeader>Analysis Error</DashboardHeader>
        <div className="container mx-auto p-6">
          <Card className="max-w-2xl mx-auto apple-card">
            <CardHeader>
              <CardTitle className="text-destructive">Error Loading Analysis</CardTitle>
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
                <Button onClick={handleRetry} className="gradient-button">
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

  // Default to 'generating' status if no reportStatus yet
  const currentStatus = reportStatus?.status || 'generating';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <DashboardHeader>Analyzing Your Idea</DashboardHeader>
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Enhanced Analysis Loader - now shows by default */}
          <EnhancedAnalysisLoader 
            status={currentStatus} 
            useAnimation={true}
          />

          {/* What's Happening Section */}
          <Card className="apple-card border-0">
            <CardContent className="p-6">
              <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-6 rounded-2xl border border-primary/10">
                <h3 className="font-semibold text-foreground mb-4 text-lg">What's happening behind the scenes:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      <span className="text-sm text-muted-foreground">Market research agents gathering industry data</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <span className="text-sm text-muted-foreground">Competition analysis identifying key players</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-success rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                      <span className="text-sm text-muted-foreground">Financial models calculating market opportunity</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-warning rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
                      <span className="text-sm text-muted-foreground">SWOT analysis evaluating strengths and risks</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-info rounded-full animate-pulse" style={{animationDelay: '0.8s'}}></div>
                      <span className="text-sm text-muted-foreground">Comprehensive scoring across multiple factors</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Button onClick={() => navigate('/dashboard')} variant="outline" className="apple-button-outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            {reportStatus?.status === 'failed' && (
              <Button onClick={handleRetry} className="gradient-button">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Analysis
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyzingIdeaPage;
