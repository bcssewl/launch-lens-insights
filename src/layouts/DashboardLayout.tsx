
import React from 'react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/AppSidebar';
import { SkipNav } from '@/components/ui/skip-nav';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <>
      <SkipNav href="#main-content">Skip to main content</SkipNav>
      <SidebarProvider>
        <div className="min-h-screen flex w-full overflow-x-hidden apple-hero">
          <AppSidebar />
          <SidebarInset className="flex-1 flex flex-col overflow-x-hidden">
            <div className="flex flex-col h-full w-full overflow-x-hidden">
              <main 
                id="main-content"
                className="flex-1 overflow-y-auto overflow-x-hidden"
                role="main"
                aria-label="Main content"
              >
                {children}
              </main>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </>
  );
};

export default DashboardLayout;
