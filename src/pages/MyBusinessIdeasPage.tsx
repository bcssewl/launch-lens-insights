
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import DashboardHeader from '@/components/DashboardHeader';
import { FloatingElements } from '@/components/landing/FloatingElements';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import MyBusinessIdeasTabContent from '@/components/business-ideas/MyBusinessIdeasTabContent';
import BusinessIdeasPageHeader from '@/components/business-ideas/BusinessIdeasPageHeader';
import BusinessIdeasTabNavigation from '@/components/business-ideas/BusinessIdeasTabNavigation';

const MyBusinessIdeasPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="apple-hero">
        <FloatingElements />
        <DashboardHeader>My Business Ideas</DashboardHeader>
        <div className="p-4 md:p-6">
          <Tabs defaultValue="ideas" className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <BusinessIdeasPageHeader />
              <BusinessIdeasTabNavigation />
            </div>
            
            <TabsContent value="ideas" className="mt-0">
              <MyBusinessIdeasTabContent />
            </TabsContent>
            
            <TabsContent value="archived" className="mt-0">
              <MyBusinessIdeasTabContent showArchivedOnly={true} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyBusinessIdeasPage;
