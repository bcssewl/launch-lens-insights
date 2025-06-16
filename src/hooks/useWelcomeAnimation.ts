
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useWelcomeAnimation = () => {
  const { user, loading, justSignedIn, clearJustSignedIn } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (loading || !user || !justSignedIn) return;

    // Check if we should show welcome animation for this specific user
    const userWelcomeKey = `welcome-shown-${user.id}`;
    const hasShownWelcome = localStorage.getItem(userWelcomeKey);
    
    if (!hasShownWelcome) {
      // Small delay to ensure dashboard has started loading
      const timer = setTimeout(() => {
        setShowWelcome(true);
        localStorage.setItem(userWelcomeKey, 'true');
      }, 300);

      return () => clearTimeout(timer);
    } else {
      // User has already seen welcome, clear the justSignedIn flag
      clearJustSignedIn();
    }
  }, [user, loading, justSignedIn, clearJustSignedIn]);

  const hideWelcome = () => {
    setShowWelcome(false);
    clearJustSignedIn();
  };

  return {
    showWelcome,
    hideWelcome,
  };
};
