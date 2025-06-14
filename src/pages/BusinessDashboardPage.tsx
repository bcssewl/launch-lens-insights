
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import DashboardHeader from '@/components/DashboardHeader';
import MobileDashboardHeader from '@/components/mobile/MobileDashboardHeader';
import ProgressTracker from '@/components/business-dashboard/ProgressTracker';
import ValidationSummary from '@/components/business-dashboard/ValidationSummary';
import SectionStatus from '@/components/business-dashboard/SectionStatus';
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
      <div className="min-h-screen bg-gray-50 overflow-x-hidden">
        {isMobile ? (
          <MobileDashboardHeader title="Business Dashboard" showBackButton />
        ) : (
          <DashboardHeader>Business Dashboard</DashboardHeader>
        )}
        
        <div className="p-4 md:p-6 max-w-6xl mx-auto">
          {/* Back Button for Desktop */}
          {!isMobile && (
            <div className="mb-6">
              <Button asChild variant="ghost" size="sm">
                <Link to="/dashboard/ideas">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Ideas
                </Link>
              </Button>
            </div>
          )}

          {/* Validation Summary */}
          <ValidationSummary report={report} />

          {/* Progress Tracker */}
          <ProgressTracker completedSections={1} totalSections={5} />

          {/* Section Status */}
          <SectionStatus report={report} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BusinessDashboardPage;
