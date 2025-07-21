
import React from 'react';
import { SkipNav } from '@/components/ui/skip-nav';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <>
      <SkipNav href="#main-content">Skip to main content</SkipNav>
      <SidebarProvider defaultOpen={false}>
        <div className="min-h-screen flex w-full overflow-x-hidden apple-hero">
          <AppSidebar />
          <SidebarInset className="flex-1">
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
      </SidebarProvider>
    </>
  );
};

export default DashboardLayout;
