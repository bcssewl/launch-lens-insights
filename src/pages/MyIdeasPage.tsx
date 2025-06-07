
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import DashboardHeader from '@/components/DashboardHeader';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import MyIdeasTabContent from '@/components/ideas/MyIdeasTabContent';
import MyBusinessPlansTabContent from '@/components/reports/MyBusinessPlansTabContent';
import IdeasPageHeader from '@/components/ideas/IdeasPageHeader';
import IdeasTabNavigation from '@/components/ideas/IdeasTabNavigation';

const MyIdeasPage: React.FC = () => {
  return (
    <DashboardLayout>
      <DashboardHeader>My Ideas</DashboardHeader>
      <div className="p-4 md:p-6">
        <Tabs defaultValue="ideas" className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <IdeasPageHeader />
            <IdeasTabNavigation />
          </div>
          
          <TabsContent value="ideas" className="mt-0">
            <MyIdeasTabContent />
          </TabsContent>
          
          <TabsContent value="business-plans" className="mt-0">
            <MyBusinessPlansTabContent />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default MyIdeasPage;
