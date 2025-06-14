
import { useState, useEffect, useRef, useCallback } from 'react';

export const useScrollAnimation = (totalSteps: number) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const handleWheel = useCallback((e: WheelEvent) => {
    if (!isActive || isComplete) return;

    e.preventDefault();
    e.stopPropagation();

    // Only advance on downward scroll
    if (e.deltaY > 0) {
      setActiveStep((prev) => {
        const next = prev + 1;
        if (next >= totalSteps) {
          setIsComplete(true);
          setIsActive(false);
          // Restore body scroll
          document.body.style.overflow = 'auto';
          return totalSteps - 1;
        }
        return next;
      });
    }
  }, [isActive, isComplete, totalSteps]);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || isActive) return;

      const section = sectionRef.current;
      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Activate when section enters viewport from above
      if (rect.top <= windowHeight * 0.3 && rect.bottom > windowHeight * 0.7 && !isComplete) {
        setIsActive(true);
        setActiveStep(0);
        // Lock body scroll
        document.body.style.overflow = 'hidden';
      } else if (rect.top > windowHeight * 0.5) {
        // Reset when scrolling back up past the section
        setIsActive(false);
        setIsComplete(false);
        setActiveStep(0);
        document.body.style.overflow = 'auto';
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial position
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.body.style.overflow = 'auto';
    };
  }, [isActive, isComplete]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const section = sectionRef.current;
    
    if (isActive && !isComplete) {
      section.addEventListener('wheel', handleWheel, { passive: false });
      
      return () => {
        section.removeEventListener('wheel', handleWheel);
      };
    }
  }, [isActive, isComplete, handleWheel]);

  return { activeStep, sectionRef, isActive };
};
