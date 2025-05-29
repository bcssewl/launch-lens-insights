
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserAvatarProps {
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ className }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);

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
        .select('avatar_url')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  return (
    <Avatar className={className}>
      <AvatarImage src={profile?.avatar_url} alt="User Avatar" />
      <AvatarFallback>
        {user?.email?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
