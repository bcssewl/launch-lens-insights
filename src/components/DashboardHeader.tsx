
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { MessageCircle, Settings, LogOut, UserCircle, Search } from 'lucide-react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ChatSearchModal } from '@/components/search/ChatSearchModal';

interface DashboardHeaderProps {
  children?: React.ReactNode;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ children }) => {
  const currentDate = format(new Date(), "PPP");
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global search hotkey
  useHotkeys('ctrl+k,cmd+k', (e) => {
    e.preventDefault();
    setIsSearchOpen(true);
  }, { enableOnFormTags: true });

  useEffect(() => {
    if (user) {
      loadProfile();
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

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="border-b border-border-subtle bg-surface">
      <div className="flex items-center justify-between p-4 bg-surface-elevated border-b border-border-subtle">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-text-primary">{children || 'Dashboard'}</h1>
          <p className="text-sm text-text-tertiary">{currentDate}</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSearchOpen(true)}
            aria-label="Search chats (Ctrl+K)"
            className="text-text-secondary hover:text-text-primary"
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search chats</span>
          </Button>
          <ThemeToggle />
          <Button variant="ghost" size="icon" aria-label="Notifications" className="text-text-secondary hover:text-text-primary">
            <MessageCircle className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url} alt="User Avatar" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-surface-elevated border-border-subtle">
              <DropdownMenuLabel className="text-text-primary">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border-subtle" />
              <DropdownMenuItem asChild className="text-text-secondary hover:text-text-primary hover:bg-surface-elevated-2">
                <Link to="/dashboard/profile">
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-text-secondary hover:text-text-primary hover:bg-surface-elevated-2">
                <Link to="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border-subtle" />
              <DropdownMenuItem onClick={handleLogout} className="text-text-secondary hover:text-text-primary hover:bg-surface-elevated-2">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <ChatSearchModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </header>
  );
};

export default DashboardHeader;
