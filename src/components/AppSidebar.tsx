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
  SidebarGroupLabel,
  SidebarRail,
  useSidebar
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
import { Home, Lightbulb, FolderOpen, Bot, Settings as SettingsIcon, UserCircle, LogOut, ChevronLeft, ChevronRight, Folder, ChevronDown, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ChatSearchModal } from '@/components/search/ChatSearchModal';
import { useHotkeys } from 'react-hotkeys-hook';

const priorityNavItems = [
  { href: "/dashboard/assistant", label: "Advisor", icon: Bot },
  { href: "/dashboard/projects", label: "Projects (Mock)", icon: Folder },
];

const otherNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/validate", label: "Analyze Idea", icon: Lightbulb },
  { href: "/dashboard/ideas", label: "Projects", icon: FolderOpen },
  { href: "/dashboard/settings", label: "Settings", icon: SettingsIcon },
];

export const AppSidebar: React.FC = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [isMoreOpen, setIsMoreOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { setOpen, isMobile, state } = useSidebar();
  const [collapseTimer, setCollapseTimer] = useState<NodeJS.Timeout | null>(null);

  // Global search hotkey
  useHotkeys('ctrl+k,cmd+k', (e) => {
    e.preventDefault();
    setIsSearchOpen(true);
  }, { enableOnFormTags: true });

  useEffect(() => {
    if (user) {
      loadProfile();
      loadChatSessions();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error loading profile:', error);
        return;
      }
      
      if (data) {
        setProfile(data);
      } else {
        // Create profile if it doesn't exist
        console.log('Profile not found, creating new profile for user:', user.id);
        await createProfile();
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const createProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || '',
          avatar_url: user.user_metadata?.avatar_url || null
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating profile:', error);
        return;
      }
      
      if (data) {
        setProfile(data);
        console.log('Profile created successfully');
      }
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  const loadChatSessions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('id, title, created_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Error loading chat sessions:', error);
        return;
      }
      
      setChatSessions(data || []);
    } catch (error) {
      console.error('Error loading chat sessions:', error);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  // Handle hover expand/collapse functionality
  const handleMouseEnter = () => {
    if (collapseTimer) {
      clearTimeout(collapseTimer);
      setCollapseTimer(null);
    }
    setOpen(true);
  };

  const handleMouseLeave = () => {
    const timer = setTimeout(() => {
      setOpen(false);
    }, 2000);
    setCollapseTimer(timer);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (collapseTimer) {
        clearTimeout(collapseTimer);
      }
    };
  }, [collapseTimer]);

  // Helper function to check if a chat session is currently active
  const isActiveChatSession = (sessionId: string) => {
    const urlParams = new URLSearchParams(location.search);
    return location.pathname === '/dashboard/assistant' && urlParams.get('session') === sessionId;
  };

  return (
    <div className="relative">
      <Sidebar 
        collapsible="icon" 
        className="border-r border-border-subtle bg-surface"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <SidebarHeader className="p-4 bg-surface border-b border-border-subtle">
          <div className="flex items-center justify-center group-data-[collapsible=icon]:justify-center px-3">
            <Logo />
          </div>
        </SidebarHeader>
        
        <SidebarContent className="flex-grow bg-surface">
          {/* Priority navigation items */}
          <SidebarGroup>
            <SidebarGroupContent className="px-2 group-data-[collapsible=icon]:px-1">
              <SidebarMenu>
                {priorityNavItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.href}
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
                
                {/* Search Button */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setIsSearchOpen(true)}
                    tooltip="Search Chats (Ctrl+K)"
                    className="group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-1 text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors cursor-pointer flex items-center gap-3 px-3 py-2 group-data-[collapsible=icon]:gap-0"
                  >
                    <Search className="h-5 w-5 flex-shrink-0" />
                    <span className="group-data-[collapsible=icon]:sr-only">Search Chats</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Chat Search Modal */}
          <ChatSearchModal 
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
          />

          {/* Chats Section - Always visible and separate from More section */}
          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:sr-only px-2 text-xs font-medium text-text-secondary/70">
              Chats
            </SidebarGroupLabel>
            <SidebarGroupContent className="px-2 group-data-[collapsible=icon]:px-1">
              <SidebarMenu>
                {chatSessions.length === 0 ? (
                  <SidebarMenuItem>
                    <div className="px-3 py-2 text-xs text-text-secondary/50 group-data-[collapsible=icon]:hidden">
                      No chats yet
                    </div>
                  </SidebarMenuItem>
                ) : (
                  chatSessions.map((session) => (
                    <SidebarMenuItem key={session.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActiveChatSession(session.id)}
                        tooltip={session.title}
                        className="group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-1 text-text-secondary hover:text-text-primary hover:bg-surface-elevated data-[active=true]:text-primary data-[active=true]:bg-surface-elevated transition-colors"
                      >
                        <Link to={`/dashboard/assistant?session=${session.id}`} className="flex items-center gap-3 px-3 py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:gap-0">
                          <span className="group-data-[collapsible=icon]:sr-only text-sm truncate">
                            {session.title || 'New Chat'}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Collapsible group for other navigation items */}
          <Collapsible open={isMoreOpen} onOpenChange={setIsMoreOpen}>
            <SidebarGroup>
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="group-data-[collapsible=icon]:sr-only hover:bg-surface-elevated cursor-pointer flex items-center justify-between p-2 rounded-md">
                  <span>More</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isMoreOpen ? 'rotate-180' : ''}`} />
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent className="px-2 group-data-[collapsible=icon]:px-1">
                  <SidebarMenu>
                    {otherNavItems.map((item) => (
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
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
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
      
    </div>
  );
};
