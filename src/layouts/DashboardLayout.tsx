
import React from 'react';
import { SkipNav } from '@/components/ui/skip-nav';
import TopHeader from '@/components/navigation/TopHeader';
import BottomNavigation from '@/components/navigation/BottomNavigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <>
      <SkipNav href="#main-content">Skip to main content</SkipNav>
      <div className="min-h-screen flex flex-col w-full overflow-x-hidden apple-hero">
        <TopHeader />
        <div className="flex-1 flex flex-col overflow-x-hidden">
          <main 
            id="main-content"
            className="flex-1 overflow-y-auto overflow-x-hidden pb-20"
            role="main"
            aria-label="Main content"
          >
            {children}
          </main>
        </div>
        <BottomNavigation />
      </div>
    </>
  );
};

export default DashboardLayout;
