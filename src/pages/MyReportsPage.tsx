
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import DashboardHeader from '@/components/DashboardHeader';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import MyReportsTabContent from '@/components/reports/MyReportsTabContent';
import MyBusinessPlansTabContent from '@/components/reports/MyBusinessPlansTabContent';
import ReportsPageHeader from '@/components/reports/ReportsPageHeader';
import ReportsTabNavigation from '@/components/reports/ReportsTabNavigation';

const MyReportsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="min-h-screen page-background">
        {/* Glassmorphism Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/50 to-background">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="relative z-10">
          <DashboardHeader>My Reports</DashboardHeader>
          <div className="p-4 md:p-6">
            <Tabs defaultValue="reports" className="w-full">
              <div className="bg-white/5 backdrop-blur-sm border-b border-white/10 p-4 -mx-4 md:-mx-6 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <ReportsPageHeader />
                  <ReportsTabNavigation />
                </div>
              </div>
              
              <TabsContent value="reports" className="mt-0">
                <MyReportsTabContent />
              </TabsContent>
              
              <TabsContent value="business-plans" className="mt-0">
                <MyBusinessPlansTabContent />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyReportsPage;
