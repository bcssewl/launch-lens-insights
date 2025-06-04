import React, { useState } from 'react';
import { Search, Menu, Home, Lightbulb, FileText, Bot, Settings as SettingsIcon, UserCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface MobileDashboardHeaderProps {
  title?: string;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/validate", label: "Validate Idea", icon: Lightbulb },
  { href: "/dashboard/reports", label: "My Reports", icon: FileText },
  { href: "/dashboard/assistant", label: "AI Assistant", icon: Bot },
  { href: "/dashboard/settings", label: "Settings", icon: SettingsIcon },
];

const MobileDashboardHeader: React.FC<MobileDashboardHeaderProps> = ({ title = 'Dashboard' }) => {
  const currentDate = format(new Date(), "MMM dd, yyyy");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    setIsMenuOpen(false);
    navigate('/login');
  };

  const handleMenuItemClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50 md:hidden">
        <div className="flex items-center justify-between px-4 py-3 h-14">
          {/* Left: Hamburger Menu */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-lg w-10 h-10"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
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

      {/* Mobile Navigation Sheet */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="left" className="w-[280px] bg-background border-r border-border p-0">
          <SheetHeader className="border-b border-border p-6 pb-4">
            <SheetTitle className="text-lg font-semibold text-left">Menu</SheetTitle>
          </SheetHeader>
          
          <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden">
            {/* Navigation Items */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
              <div className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={handleMenuItemClick}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === item.href || 
                      (item.href === "/dashboard" && location.pathname.startsWith("/dashboard") && location.pathname.split('/').length <= 2)
                        ? 'bg-primary/10 text-primary' 
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </nav>

            {/* User Profile Section */}
            <div className="border-t border-border p-4 mt-auto">
              <div className="flex items-center gap-3 px-3 py-2 mb-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt="User Avatar" />
                  <AvatarFallback>
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user?.email || 'User'}
                  </p>
                  <Link 
                    to="/dashboard/billing" 
                    onClick={handleMenuItemClick}
                    className="text-xs text-primary hover:underline"
                  >
                    Upgrade Plan
                  </Link>
                </div>
              </div>
              
              <div className="space-y-1">
                <Link
                  to="/dashboard/profile"
                  onClick={handleMenuItemClick}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <UserCircle className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground w-full text-left"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobileDashboardHeader;
