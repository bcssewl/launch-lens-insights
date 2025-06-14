
import { useState, useEffect } from 'react';

export const useHeroScrollTrigger = () => {
  const [hasScrolledPastHero, setHasScrolledPastHero] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Detect when user has scrolled past 70% of viewport height (approximate hero section)
      const scrollPosition = window.scrollY;
      const heroThreshold = window.innerHeight * 0.7;
      
      setHasScrolledPastHero(scrollPosition > heroThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    
    // Check initial scroll position
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return hasScrolledPastHero;
};
