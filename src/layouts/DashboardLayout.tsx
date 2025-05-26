
import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/AppSidebar';
import { Button } from '@/components/ui/button';
import { PanelLeft } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col">
          {/* Wrap the children of SidebarInset in a single div */}
          <div className="flex flex-col h-full w-full"> {/* Added w-full for safety */}
            {/* Mobile Sidebar Trigger - Placed inside SidebarInset for proper positioning relative to main content */}
            <div className="p-2 md:hidden sticky top-0 bg-background z-10 border-b"> 
               <SidebarTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <PanelLeft />
                    <span className="sr-only">Toggle Sidebar</span>
                  </Button>
                </SidebarTrigger>
            </div>
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;

