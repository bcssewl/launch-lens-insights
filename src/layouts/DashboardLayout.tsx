
import React from 'react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/AppSidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-surface via-surface to-surface-elevated overflow-x-hidden">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col overflow-x-hidden bg-surface">
          <div className="flex flex-col h-full w-full overflow-x-hidden">
            <main className="flex-1 overflow-y-auto overflow-x-hidden bg-surface">
              {children}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
