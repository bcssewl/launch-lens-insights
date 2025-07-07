
import React, { useState } from 'react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/AppSidebar';
import { SkipNav } from '@/components/ui/skip-nav';
import { ChatSearchModal } from '@/components/search/ChatSearchModal';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useHotkeys } from 'react-hotkeys-hook';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global search hotkey
  useHotkeys('ctrl+k,cmd+k', (e) => {
    e.preventDefault();
    setIsSearchOpen(true);
  }, { enableOnFormTags: true });

  return (
    <>
      <SkipNav href="#main-content">Skip to main content</SkipNav>
      <SidebarProvider>
        <div className="min-h-screen flex w-full overflow-x-hidden apple-hero">
          <AppSidebar />
          <SidebarInset className="flex-1 flex flex-col overflow-x-hidden">
            {/* Fixed search button in top-right */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(true)}
              className="fixed top-4 right-4 z-50 h-9 w-9 bg-surface/80 backdrop-blur-sm border border-border-subtle shadow-sm hover:bg-surface-elevated text-text-secondary hover:text-text-primary"
              aria-label="Search chats (Ctrl+K)"
            >
              <Search className="h-4 w-4" />
            </Button>

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

      <ChatSearchModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
};

export default DashboardLayout;
