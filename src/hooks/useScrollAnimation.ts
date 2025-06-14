
import { useState, useEffect, useRef } from 'react';

export const useScrollAnimation = (totalSteps: number) => {
  const [activeStep, setActiveStep] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const section = sectionRef.current;
      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how much of the section is visible
      const sectionTop = rect.top;
      const sectionHeight = rect.height;
      
      // Start animation when section enters viewport
      if (sectionTop < windowHeight && sectionTop + sectionHeight > 0) {
        // Calculate scroll progress through the section
        const scrollProgress = Math.max(0, Math.min(1, (windowHeight - sectionTop) / (windowHeight + sectionHeight * 0.5)));
        
        // Map scroll progress to step index
        const step = Math.floor(scrollProgress * totalSteps);
        setActiveStep(Math.min(step, totalSteps - 1));
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [totalSteps]);

  return { activeStep, sectionRef };
};
