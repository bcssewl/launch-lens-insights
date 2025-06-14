
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import DashboardHeader from '@/components/DashboardHeader';
import MobileDashboardHeader from '@/components/mobile/MobileDashboardHeader';
import BusinessDashboardTabs from '@/components/business-dashboard/BusinessDashboardTabs';
import { useValidationReport } from '@/hooks/useValidationReport';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';

const BusinessDashboardPage: React.FC = () => {
  const { ideaId } = useParams<{ ideaId: string }>();
  const isMobile = useIsMobile();
  const { report, loading, error } = useValidationReport(ideaId || '');

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 overflow-x-hidden">
          {isMobile ? (
            <MobileDashboardHeader title="Business Dashboard" />
          ) : (
            <DashboardHeader>Business Dashboard</DashboardHeader>
          )}
          <div className="p-4 md:p-6 space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !report) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 overflow-x-hidden">
          {isMobile ? (
            <MobileDashboardHeader title="Business Dashboard" />
          ) : (
            <DashboardHeader>Business Dashboard</DashboardHeader>
          )}
          <div className="p-4 md:p-6">
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">
                {error || 'Business idea not found'}
              </p>
              <div className="flex gap-2 justify-center">
                <Button asChild variant="outline">
                  <Link to="/dashboard/ideas">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Ideas
                  </Link>
                </Button>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 7) return 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 border-green-300 dark:border-green-700';
    if (score >= 4) return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700';
    return 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 border-red-300 dark:border-red-700';
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 overflow-x-hidden">
        {isMobile ? (
          <MobileDashboardHeader title="Business Dashboard" showBackButton />
        ) : (
          <DashboardHeader>Business Dashboard</DashboardHeader>
        )}
        
        <div className="p-4 md:p-6 space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {!isMobile && (
                <Button asChild variant="ghost" size="sm">
                  <Link to="/dashboard/ideas">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Ideas
                  </Link>
                </Button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {report.idea_name || 'Untitled Idea'}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {report.one_line_description || 'No description available'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={`${getScoreBadgeColor(report.overall_score || 0)} whitespace-nowrap text-sm px-3 py-1`}>
                Score: {(report.overall_score || 0).toFixed(1)}/10
              </Badge>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Last updated</p>
                <p className="text-sm font-medium">
                  {report.completed_at 
                    ? new Date(report.completed_at).toLocaleDateString()
                    : new Date(report.created_at).toLocaleDateString()
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <BusinessDashboardTabs report={report} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BusinessDashboardPage;
