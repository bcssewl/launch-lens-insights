import React, { useState } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { FloatingElements } from '@/components/landing/FloatingElements';
import DashboardHeader from '@/components/DashboardHeader';
import MobileDashboardHeader from '@/components/mobile/MobileDashboardHeader';
import StreamingChat from '@/components/StreamingChat';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from 'next-themes';

const AIAssistantPage: React.FC = () => {
  const isMobile = useIsMobile();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { theme } = useTheme();

  if (isFullscreen) {
    return (
      <div className="h-screen w-screen bg-background">
        <StreamingChat />
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-4 right-4 z-50 bg-background border rounded-lg p-2 shadow-lg hover:bg-accent"
        >
          Exit Fullscreen
        </button>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
        <FloatingElements />
        
        <MobileDashboardHeader 
          title="AI Assistant"
          onToggleFullscreen={() => setIsFullscreen(true)}
        />
        
        <div className="flex-1 overflow-hidden">
          <StreamingChat />
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
        <FloatingElements />
        <AppSidebar />
        
        <SidebarInset className="flex-1 flex flex-col min-w-0">
          <DashboardHeader 
            title="AI Assistant"
            subtitle="Powered by advanced AI research specialists"
            onToggleFullscreen={() => setIsFullscreen(true)}
          />
          
          <div className="flex-1 overflow-hidden">
            <StreamingChat />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AIAssistantPage;
