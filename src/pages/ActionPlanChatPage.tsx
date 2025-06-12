
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useValidationReport } from '@/hooks/useValidationReport';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ActionPlanAgent from '@/components/actionplan/ActionPlanAgent';

const ActionPlanChatPage: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const { report, loading, error } = useValidationReport(reportId || '');

  const handleGoBack = () => {
    navigate(`/results/${reportId}`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
          <div className="w-full max-w-7xl mx-auto px-6 py-8 space-y-6">
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-96 w-full rounded-3xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !report) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
          <div className="w-full max-w-7xl mx-auto px-6 py-8">
            <Alert variant="destructive" className="rounded-2xl border-0 shadow-lg">
              <AlertDescription>
                {error || 'Report not found'}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
        <div className="w-full max-w-7xl mx-auto px-6 py-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={handleGoBack}
                className="flex items-center gap-2 hover:bg-muted/50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Report
              </Button>
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-bold text-foreground">Action Plan Generator</h1>
              <p className="text-sm text-muted-foreground">Create a lean startup action plan for "{report.idea_name}"</p>
            </div>
          </div>

          {/* Chat Interface */}
          <ActionPlanAgent report={report} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ActionPlanChatPage;
