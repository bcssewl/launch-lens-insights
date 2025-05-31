
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
      <DashboardHeader>My Reports</DashboardHeader>
      <div className="p-4 md:p-6">
        <Tabs defaultValue="reports" className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <ReportsPageHeader />
            <ReportsTabNavigation />
          </div>
          
          <TabsContent value="reports" className="mt-0">
            <MyReportsTabContent />
          </TabsContent>
          
          <TabsContent value="business-plans" className="mt-0">
            <MyBusinessPlansTabContent />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default MyReportsPage;
