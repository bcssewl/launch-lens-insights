
import { useState, useEffect } from 'react';

const AD_POPUP_STORAGE_KEY = 'idea-validator-ad-popup-shown';
const POPUP_DELAY_MS = 3000; // 3 seconds

export const useAdPopup = (shouldShow: boolean = true) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    if (!shouldShow) return;

    // Check if popup has been shown before
    const hasBeenShown = localStorage.getItem(AD_POPUP_STORAGE_KEY);
    
    if (!hasBeenShown) {
      // Show popup after a delay
      const timer = setTimeout(() => {
        setIsPopupOpen(true);
      }, POPUP_DELAY_MS);

      return () => clearTimeout(timer);
    }
  }, [shouldShow]);

  const closePopup = () => {
    setIsPopupOpen(false);
    // Mark as shown in localStorage
    localStorage.setItem(AD_POPUP_STORAGE_KEY, 'true');
  };

  return {
    isPopupOpen,
    closePopup
  };
};
