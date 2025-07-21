
import React from 'react';
import { SkipNav } from '@/components/ui/skip-nav';
import TopHeader from '@/components/navigation/TopHeader';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

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
          <SidebarInset>
            <div className="flex flex-col min-h-screen">
              <TopHeader />
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
