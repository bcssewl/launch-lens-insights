import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarRail,
  useSidebar
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Logo } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, Lightbulb, FolderOpen, Bot, Settings as SettingsIcon, UserCircle, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/validate", label: "Analyze Idea", icon: Lightbulb },
  { href: "/dashboard/ideas", label: "Projects", icon: FolderOpen },
  { href: "/dashboard/assistant", label: "Advisor", icon: Bot },
  { href: "/dashboard/settings", label: "Settings", icon: SettingsIcon },
];

export const AppSidebar: React.FC = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const { setOpen, isMobile, state, toggleSidebar } = useSidebar();

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  const handleToggleSidebar = () => {
    toggleSidebar();
  };

  return (
    <div className="relative">
      <Sidebar collapsible="icon" className="border-r border-border-subtle bg-surface">
        <SidebarHeader className="p-4 bg-surface border-b border-border-subtle">
          <div className="flex items-center justify-center group-data-[collapsible=icon]:justify-center px-3">
            <Logo />
          </div>
        </SidebarHeader>
        
        <SidebarContent className="flex-grow bg-surface">
          <SidebarGroup>
            <SidebarGroupContent className="px-2 group-data-[collapsible=icon]:px-1">
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.href || (item.href === "/dashboard" && location.pathname.startsWith("/dashboard") && location.pathname.split('/').length <= 2)}
                      tooltip={item.label}
                      className="group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-1 text-text-secondary hover:text-text-primary hover:bg-surface-elevated data-[active=true]:text-primary data-[active=true]:bg-surface-elevated transition-colors"
                    >
                      <Link to={item.href} className="flex items-center gap-3 px-3 py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:gap-0">
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        <span className="group-data-[collapsible=icon]:sr-only">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarFooter className="p-4 border-t border-border-subtle bg-surface">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-3 p-2 rounded-md hover:bg-surface-elevated w-full text-left group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:space-x-0 group-data-[collapsible=icon]:px-1 transition-colors">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={profile?.avatar_url} alt="User Avatar" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="group-data-[collapsible=icon]:sr-only">
                  <p className="text-sm font-medium text-text-primary">
                    {profile?.full_name || user?.email || 'User'}
                  </p>
                  <Link to="/dashboard/billing" className="text-xs text-primary hover:underline">
                    Upgrade Plan
                  </Link>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56 mb-2 ml-1 bg-surface-elevated border-border-subtle">
              <DropdownMenuLabel className="text-text-primary">
                {profile?.full_name || user?.email || 'User'}
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
        </SidebarFooter>
        
        <SidebarRail />
      </Sidebar>
      
      {/* Toggle button positioned fixed on the right edge, vertically centered - only visible on desktop */}
      {!isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleSidebar}
          className="fixed top-1/2 left-[var(--sidebar-width)] transform -translate-y-1/2 -translate-x-4 h-8 w-8 rounded-full bg-surface-elevated border border-border-subtle shadow-sm hover:bg-surface-elevated-2 z-50 transition-all duration-200"
          style={{
            left: state === "expanded" ? "var(--sidebar-width)" : "var(--sidebar-width-icon)",
          }}
          aria-label="Toggle sidebar"
        >
          {state === "expanded" ? (
            <ChevronLeft className="h-4 w-4 text-text-secondary" />
          ) : (
            <ChevronRight className="h-4 w-4 text-text-secondary" />
          )}
        </Button>
      )}
    </div>
  );
};
