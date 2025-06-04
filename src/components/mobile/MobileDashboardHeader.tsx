
import React from 'react';
import { Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { format } from 'date-fns';

interface MobileDashboardHeaderProps {
  title?: string;
}

const MobileDashboardHeader: React.FC<MobileDashboardHeaderProps> = ({ title = 'Dashboard' }) => {
  const currentDate = format(new Date(), "MMM dd, yyyy");

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50 md:hidden ios-safe-top">
      <div className="flex items-center justify-between mobile-spacing">
        {/* Left: Hamburger Menu */}
        <Button variant="ghost" size="icon" className="rounded-xl touch-target" asChild>
          <SidebarTrigger>
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
        </Button>

        {/* Center: Title and Date */}
        <div className="flex flex-col items-center text-center">
          <h1 className="mobile-heading text-foreground">{title}</h1>
          <p className="text-xs text-muted-foreground">{currentDate}</p>
        </div>

        {/* Right: Search and Theme Toggle */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="rounded-xl touch-target">
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default MobileDashboardHeader;
