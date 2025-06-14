
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import DashboardHeader from '@/components/DashboardHeader';
import MobileDashboardHeader from '@/components/mobile/MobileDashboardHeader';
import ValidationSummary from '@/components/business-dashboard/ValidationSummary';
import BusinessDashboardTabs from '@/components/business-dashboard/BusinessDashboardTabs';
import { useValidationReport } from '@/hooks/useValidationReport';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

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
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
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

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 overflow-x-hidden">
        {isMobile ? (
          <MobileDashboardHeader title="Business Dashboard" showBackButton />
        ) : (
          <DashboardHeader>Business Dashboard</DashboardHeader>
        )}
        
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          {/* Back Button for Desktop */}
          {!isMobile && (
            <div className="mb-6">
              <Button asChild variant="ghost" size="sm">
                <Link to="/dashboard/ideas">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to My Ideas
                </Link>
              </Button>
            </div>
          )}

          {/* Business Idea Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {report.idea_name || 'Untitled Business Idea'}
                </h1>
                <p className="text-lg text-muted-foreground mb-4">
                  {report.one_line_description || 'No description available'}
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold text-green-600">
                      {(report.overall_score || 0).toFixed(1)}/10
                    </div>
                    <span className="text-sm text-muted-foreground">Validation Score</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Last updated {report.completed_at 
                      ? new Date(report.completed_at).toLocaleDateString()
                      : new Date(report.created_at).toLocaleDateString()
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Development Progress</h3>
              <span className="text-sm text-muted-foreground">1 of 5 sections complete</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full w-1/5"></div>
            </div>
          </div>

          {/* Tabbed Dashboard Content */}
          <BusinessDashboardTabs report={report} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BusinessDashboardPage;
