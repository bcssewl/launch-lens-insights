
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
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50 md:hidden">
      <div className="flex items-center justify-between px-4 py-3 h-14">
        {/* Left: Hamburger Menu */}
        <Button variant="ghost" size="icon" className="rounded-lg w-10 h-10" asChild>
          <SidebarTrigger>
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
        </Button>

        {/* Center: Title and Date */}
        <div className="flex flex-col items-center text-center flex-1 mx-4">
          <h1 className="text-base font-semibold text-foreground leading-tight">{title}</h1>
          <p className="text-xs text-muted-foreground leading-tight">{currentDate}</p>
        </div>

        {/* Right: Search and Theme Toggle */}
        <div className="flex items-center space-x-1">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="rounded-lg w-10 h-10">
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default MobileDashboardHeader;
