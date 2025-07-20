

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  full_name?: string;
}

export const useGreeting = () => {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState<string>('');
  const [primaryGreeting, setPrimaryGreeting] = useState<string>('');
  const [assistanceMessage, setAssistanceMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Get time-based greeting with professional messaging - returns object with two parts
  const getTimeBasedGreeting = (firstName: string) => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return {
        primary: firstName ? `Good morning, ${firstName}` : 'Good morning',
        assistance: 'How may I assist you today?'
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        primary: firstName ? `Good afternoon, ${firstName}` : 'Good afternoon',
        assistance: 'What can I help you with?'
      };
    } else if (hour >= 17 && hour < 22) {
      return {
        primary: firstName ? `Good evening, ${firstName}` : 'Good evening',
        assistance: 'How can I support your work?'
      };
    } else {
      return {
        primary: firstName ? `Working late, ${firstName}?` : 'Working late?',
        assistance: 'Let me know how I can assist.'
      };
    }
  };

  // Extract first name from full name
  const extractFirstName = (fullName: string) => {
    return fullName.split(' ')[0];
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setPrimaryGreeting('Welcome');
        setAssistanceMessage('How may I assist you today?');
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
          const greeting = getTimeBasedGreeting(firstNameExtracted);
          setPrimaryGreeting(greeting.primary);
          setAssistanceMessage(greeting.assistance);
        } else {
          setFirstName('');
          const greeting = getTimeBasedGreeting('');
          setPrimaryGreeting(greeting.primary);
          setAssistanceMessage(greeting.assistance);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setFirstName('');
        const greeting = getTimeBasedGreeting('');
        setPrimaryGreeting(greeting.primary);
        setAssistanceMessage(greeting.assistance);
      } finally {  
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  // Update greeting every minute to keep time-based greeting current
  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        const greeting = getTimeBasedGreeting(firstName);
        setPrimaryGreeting(greeting.primary);
        setAssistanceMessage(greeting.assistance);
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [firstName, user]);

  return { primaryGreeting, assistanceMessage, isLoading, firstName };
};

