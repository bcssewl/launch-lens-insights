
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
        if (next >= totalSteps - 1) {
          setIsComplete(true);
          // Allow a small delay before releasing scroll lock
          setTimeout(() => {
            setIsActive(false);
          }, 500);
          return totalSteps - 1;
        }
        return next;
      });
    }
  }, [isActive, isComplete, totalSteps]);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const section = sectionRef.current;
      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Check if section is in viewport
      const sectionTop = rect.top;
      const sectionBottom = rect.bottom;
      
      // Activate when section enters viewport from above
      if (sectionTop <= windowHeight * 0.5 && sectionBottom > windowHeight * 0.5) {
        if (!isActive && !isComplete) {
          setIsActive(true);
          setActiveStep(0);
        }
      } else if (sectionTop > windowHeight * 0.5) {
        // Reset when scrolling back up past the section
        setIsActive(false);
        setIsComplete(false);
        setActiveStep(0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial position
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isActive, isComplete]);

  useEffect(() => {
    if (isActive && !isComplete) {
      // Add wheel event listener with passive: false to allow preventDefault
      window.addEventListener('wheel', handleWheel, { passive: false });
      
      return () => {
        window.removeEventListener('wheel', handleWheel);
      };
    }
  }, [isActive, isComplete, handleWheel]);

  return { activeStep, sectionRef, isActive };
};
