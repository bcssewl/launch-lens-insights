
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import DashboardHeader from '@/components/DashboardHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MyReportsTabContent from '@/components/reports/MyReportsTabContent';
import MyBusinessPlansTabContent from '@/components/reports/MyBusinessPlansTabContent';

const MyReportsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <DashboardHeader>My Reports</DashboardHeader>
      <div className="p-4 md:p-6">
        <Tabs defaultValue="reports" className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Reports & Business Plans</h2>
              <p className="text-sm text-muted-foreground">Manage your idea validations and business planning.</p>
            </div>
            <TabsList className="grid w-full sm:w-auto grid-cols-2">
              <TabsTrigger value="reports">My Reports</TabsTrigger>
              <TabsTrigger value="business-plans">My Business Plans</TabsTrigger>
            </TabsList>
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
