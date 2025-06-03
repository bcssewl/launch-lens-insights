
import { useState, useEffect } from 'react';

export const useScrollPosition = (threshold: number = 100) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > threshold);
    };

    window.addEventListener('scroll', handleScroll);
    
    // Check initial scroll position
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]);

  return isScrolled;
};
