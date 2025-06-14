
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import DashboardHeader from '@/components/DashboardHeader';
import MobileDashboardHeader from '@/components/mobile/MobileDashboardHeader';
import MobileAddNewSection from '@/components/mobile/MobileAddNewSection';
import MobileStatsCards from '@/components/mobile/MobileStatsCards';
import MobileRecentActivity from '@/components/mobile/MobileRecentActivity';
import MobileInsightsSection from '@/components/mobile/MobileInsightsSection';
import DashboardQuickActions from '@/components/dashboard/DashboardQuickActions';
import DashboardMetrics from '@/components/dashboard/DashboardMetrics';
import DashboardContent from '@/components/dashboard/DashboardContent';
import WelcomeAnimation from '@/components/WelcomeAnimation';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useIsMobile } from '@/hooks/use-mobile';
import { useWelcomeAnimation } from '@/hooks/useWelcomeAnimation';

const DashboardPage: React.FC = () => {
  const { stats, recentActivities, loading, refreshData } = useDashboardData();
  const isMobile = useIsMobile();
  const { showWelcome, hideWelcome } = useWelcomeAnimation();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 overflow-x-hidden">
          {isMobile ? <MobileDashboardHeader /> : <DashboardHeader />}
          <div className={isMobile ? "mobile-container space-y-4" : "p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8"}>
            {/* Quick Action Section */}
            {!isMobile && (
              <section className="flex flex-col sm:flex-row items-center gap-4">
                <DashboardQuickActions onRefresh={refreshData} />
              </section>
            )}

            {/* Loading skeletons */}
            <section className="grid gap-3 md:gap-6 md:grid-cols-2 xl:grid-cols-4">
              {[...Array(isMobile ? 3 : 4)].map((_, i) => (
                <Skeleton key={i} className="h-24 md:h-32 w-full rounded-2xl md:rounded-3xl" />
              ))}
            </section>
            
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-8">
              <Skeleton className="lg:col-span-2 h-48 md:h-60 rounded-2xl md:rounded-3xl" />
              <Skeleton className="h-48 md:h-60 rounded-2xl md:rounded-3xl" />
            </section>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 overflow-x-hidden">
        {/* Conditional Header Rendering */}
        {isMobile ? <MobileDashboardHeader /> : <DashboardHeader />}
        
        <div className={isMobile ? "mobile-container space-y-4" : "p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8"}>
          {/* Mobile Add New Section - Only show on mobile */}
          {isMobile && (
            <section className="w-full">
              <MobileAddNewSection />
            </section>
          )}

          {/* Quick Action Section - Desktop only */}
          {!isMobile && (
            <DashboardQuickActions onRefresh={refreshData} />
          )}

          {/* Mobile Stats Cards */}
          {isMobile && (
            <section className="w-full">
              <MobileStatsCards stats={stats} />
            </section>
          )}

          {/* Desktop Metrics Cards Grid */}
          {!isMobile && (
            <DashboardMetrics stats={stats} />
          )}

          {/* Mobile Recent Activity */}
          {isMobile && (
            <section className="w-full">
              <MobileRecentActivity recentActivities={recentActivities} />
            </section>
          )}

          {/* Mobile Insights Section */}
          {isMobile && (
            <section className="w-full">
              <MobileInsightsSection hasValidatedIdeas={stats.ideasValidated > 0} />
            </section>
          )}
          
          {/* Desktop Recent Activity Feed & Quick Insights Panel */}
          {!isMobile && (
            <DashboardContent 
              recentActivities={recentActivities} 
              hasValidatedIdeas={stats.ideasValidated > 0} 
            />
          )}
        </div>

        {/* Welcome Animation */}
        {showWelcome && <WelcomeAnimation onComplete={hideWelcome} />}
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
