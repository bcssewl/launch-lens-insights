
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
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-muted/10">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col">
          <div className="flex flex-col h-full w-full">
            {/* Mobile Sidebar Trigger with Apple-style positioning */}
            <div className="p-4 md:hidden sticky top-0 bg-background/80 backdrop-blur-xl z-10 border-b border-border/50">
              <Button variant="ghost" size="icon" aria-label="Toggle Sidebar" className="rounded-xl hover:bg-muted/50" asChild>
                <SidebarTrigger>
                  <PanelLeft className="h-5 w-5" />
                </SidebarTrigger>
              </Button>
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
