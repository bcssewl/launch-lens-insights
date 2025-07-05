
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProjectsTabContent from '@/components/reports/ProjectsTabContent';

const ProjectsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="apple-hero">
        <div className="p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Clients (Mock)</h1>
              <p className="text-muted-foreground">Manage your client workspaces and consulting engagements</p>
            </div>

            <Tabs defaultValue="clients" className="w-full">
              <TabsList className="grid w-full sm:w-auto grid-cols-1">
                <TabsTrigger value="clients">All Clients</TabsTrigger>
              </TabsList>
              
              <TabsContent value="clients" className="mt-6">
                <ProjectsTabContent />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProjectsPage;
