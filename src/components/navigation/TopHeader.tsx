
import React from 'react';
import { Link } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from '@/components/icons';
import { UserCircle, Settings as SettingsIcon, LogOut, Lightbulb } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const TopHeader: React.FC = () => {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className="h-16 border-b border-border-subtle bg-surface flex items-center justify-between px-6">
      {/* Logo on the left */}
      <Link to="/dashboard" className="flex items-center">
        <Logo />
      </Link>

      {/* User profile on the right */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center space-x-3 p-2 rounded-md hover:bg-surface-elevated transition-colors">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.user_metadata?.avatar_url} alt="User Avatar" />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-text-primary hidden md:block">
              {user?.user_metadata?.full_name || user?.email || 'User'}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end" className="w-56 bg-surface-elevated border-border-subtle">
          <DropdownMenuLabel className="text-text-primary">
            {user?.user_metadata?.full_name || user?.email || 'User'}
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border-subtle" />
          <DropdownMenuItem asChild className="text-text-secondary hover:text-text-primary hover:bg-surface-elevated-2">
            <Link to="/dashboard/profile" className="flex items-center">
              <UserCircle className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="text-text-secondary hover:text-text-primary hover:bg-surface-elevated-2">
            <Link to="/dashboard/settings" className="flex items-center">
              <SettingsIcon className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="text-text-secondary hover:text-text-primary hover:bg-surface-elevated-2">
            <Link to="/dashboard/billing" className="flex items-center">
              <Lightbulb className="mr-2 h-4 w-4" />
              <span>Billing / Upgrade</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-border-subtle" />
          <DropdownMenuItem onClick={handleLogout} className="text-text-secondary hover:text-text-primary hover:bg-surface-elevated-2">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default TopHeader;
