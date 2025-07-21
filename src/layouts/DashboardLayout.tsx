
import React from 'react';
import { SkipNav } from '@/components/ui/skip-nav';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import TopHeader from '@/components/navigation/TopHeader';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <>
      <SkipNav href="#main-content">Skip to main content</SkipNav>
      <SidebarProvider>
        <div className="min-h-screen flex flex-col w-full overflow-x-hidden apple-hero">
          <div className="flex min-h-screen w-full">
            <AppSidebar />
            <SidebarInset>
              <TopHeader />
              <main 
                id="main-content"
                className="flex-1 overflow-y-auto overflow-x-hidden"
                role="main"
                aria-label="Main content"
              >
                {children}
              </main>
            </SidebarInset>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
};

export default DashboardLayout;
