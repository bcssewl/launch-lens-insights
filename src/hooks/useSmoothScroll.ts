
import { useRef, useCallback, useEffect } from 'react';

interface UseSmoothScrollOptions {
  threshold?: number; // How close to bottom to trigger auto-scroll (in pixels)
  behavior?: 'smooth' | 'auto';
}

export const useSmoothScroll = (options: UseSmoothScrollOptions = {}) => {
  const { threshold = 100, behavior = 'smooth' } = options;
  const scrollRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const scrollTimeoutRef = useRef<number | null>(null);

  // Check if user is near the bottom
  const checkScrollPosition = useCallback(() => {
    if (!scrollRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    isNearBottomRef.current = distanceFromBottom <= threshold;
  }, [threshold]);

  // Smooth scroll to bottom only if user is near bottom
  const scrollToBottom = useCallback((force = false) => {
    if (!scrollRef.current) return;
    
    if (force || isNearBottomRef.current) {
      // Clear any pending scroll
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Use requestAnimationFrame for smoother scrolling
      scrollTimeoutRef.current = window.setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({ 
            top: scrollRef.current.scrollHeight, 
            behavior 
          });
        }
      }, 50); // Small delay to prevent scroll conflicts
    }
  }, [behavior]);

  // Set up scroll event listener
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    element.addEventListener('scroll', checkScrollPosition, { passive: true });
    
    return () => {
      element.removeEventListener('scroll', checkScrollPosition);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [checkScrollPosition]);

  return {
    scrollRef,
    scrollToBottom,
    isNearBottom: () => isNearBottomRef.current
  };
};
