
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import DashboardHeader from '@/components/DashboardHeader';
import MobileDashboardHeader from '@/components/mobile/MobileDashboardHeader';
import BusinessDashboardTabs from '@/components/business-dashboard/BusinessDashboardTabs';
import BusinessDashboardHeader from '@/components/business-dashboard/BusinessDashboardHeader';
import BusinessProgressIndicator from '@/components/business-dashboard/BusinessProgressIndicator';
import BusinessDashboardError from '@/components/business-dashboard/BusinessDashboardError';
import BusinessDashboardLoading from '@/components/business-dashboard/BusinessDashboardLoading';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useBusinessDashboard } from '@/hooks/useBusinessDashboard';

const BusinessDashboardPage: React.FC = () => {
  const { ideaId } = useParams<{ ideaId: string }>();
  const isMobile = useIsMobile();
  const { report, loading, error } = useBusinessDashboard(ideaId);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen apple-dashboard-bg overflow-x-hidden">
          {isMobile ? (
            <MobileDashboardHeader title="Business Dashboard" />
          ) : (
            <DashboardHeader>Business Dashboard</DashboardHeader>
          )}
          <BusinessDashboardLoading />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !report) {
    return (
      <DashboardLayout>
        <div className="min-h-screen apple-dashboard-bg overflow-x-hidden">
          {isMobile ? (
            <MobileDashboardHeader title="Business Dashboard" />
          ) : (
            <DashboardHeader>Business Dashboard</DashboardHeader>
          )}
          <BusinessDashboardError error={error || 'Business idea not found'} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen apple-dashboard-bg overflow-x-hidden">
        {isMobile ? (
          <MobileDashboardHeader title="Business Dashboard" showBackButton />
        ) : (
          <DashboardHeader>Business Dashboard</DashboardHeader>
        )}
        
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-8">
          {/* Back Button for Desktop */}
          {!isMobile && (
            <div className="mb-6">
              <Button asChild variant="ghost" size="sm" className="hover-lift">
                <Link to="/dashboard/ideas">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to My Ideas
                </Link>
              </Button>
            </div>
          )}

          {/* Enhanced Business Idea Header */}
          <BusinessDashboardHeader report={report} />

          {/* Enhanced Progress Indicator */}
          <BusinessProgressIndicator />

          {/* Enhanced Tabbed Dashboard Content */}
          <div className="apple-card shadow-soft">
            <BusinessDashboardTabs report={report} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BusinessDashboardPage;
