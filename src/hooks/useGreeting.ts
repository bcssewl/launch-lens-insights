import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  full_name?: string;
}

export const useGreeting = () => {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState<string>('');
  const [greeting, setGreeting] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return 'Good morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Good afternoon';
    } else if (hour >= 17 && hour < 22) {
      return 'Good evening';
    } else {
      return 'Good night';
    }
  };

  // Extract first name from full name
  const extractFirstName = (fullName: string) => {
    return fullName.split(' ')[0];
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setGreeting('Welcome');
        setFirstName('');
        setIsLoading(false);
        return;
      }

      try {
        // Try to get name from user metadata first
        let name = user.user_metadata?.full_name;
        
        // If not available, fetch from profiles table
        if (!name) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();
          
          name = (profile as Profile)?.full_name;
        }

        if (name) {
          const firstNameExtracted = extractFirstName(name);
          setFirstName(firstNameExtracted);
          setGreeting(`${getTimeBasedGreeting()}, ${firstNameExtracted}!`);
        } else {
          setFirstName('');
          setGreeting(`${getTimeBasedGreeting()}!`);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setFirstName('');
        setGreeting(`${getTimeBasedGreeting()}!`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  // Update greeting every minute to keep time-based greeting current
  useEffect(() => {
    const interval = setInterval(() => {
      if (firstName) {
        setGreeting(`${getTimeBasedGreeting()}, ${firstName}!`);
      } else if (user) {
        setGreeting(`${getTimeBasedGreeting()}!`);
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [firstName, user]);

  return { greeting, isLoading, firstName };
};
