
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bot, Lightbulb, FolderOpen, Settings as SettingsIcon, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  { href: "/dashboard/assistant", label: "AI Advisor", icon: Bot },
  { href: "/dashboard/validate", label: "Analyze Idea", icon: Lightbulb },
  { href: "/dashboard/ideas", label: "Projects", icon: FolderOpen },
  { href: "/dashboard/projects", label: "Mock Projects", icon: Folder },
  { href: "/dashboard/settings", label: "Settings", icon: SettingsIcon },
];

const BottomNavigation: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border-subtle z-50">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-center space-x-2 overflow-x-auto">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href;
            const IconComponent = item.icon;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
                )}
              >
                <IconComponent className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;
