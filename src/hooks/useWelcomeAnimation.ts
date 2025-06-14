
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useWelcomeAnimation = () => {
  const { user, loading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (loading || !user) return;

    // Check if we should show welcome animation (once per session)
    const hasShownWelcome = sessionStorage.getItem('welcome-shown');
    
    if (!hasShownWelcome) {
      // Small delay to ensure dashboard has started loading
      const timer = setTimeout(() => {
        setShowWelcome(true);
        sessionStorage.setItem('welcome-shown', 'true');
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [user, loading]);

  const hideWelcome = () => {
    setShowWelcome(false);
  };

  return {
    showWelcome,
    hideWelcome,
  };
};
