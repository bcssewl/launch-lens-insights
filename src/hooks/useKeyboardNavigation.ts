/**
 * @file useKeyboardNavigation.ts
 * @description Keyboard navigation support for DeerFlow messages and components
 */

import { useEffect, useCallback, useRef, useState } from 'react';

interface KeyboardNavigationConfig {
  enableArrowKeys: boolean;
  enableHomeEnd: boolean;
  enableTypeAhead: boolean;
  enableTabTrapping: boolean;
  focusWrap: boolean;
}

const DEFAULT_CONFIG: KeyboardNavigationConfig = {
  enableArrowKeys: true,
  enableHomeEnd: true,
  enableTypeAhead: true,
  enableTabTrapping: false,
  focusWrap: true
};

interface FocusableElement {
  element: HTMLElement;
  index: number;
  role: string;
}

export const useKeyboardNavigation = (
  containerRef: React.RefObject<HTMLElement>,
  config: Partial<KeyboardNavigationConfig> = {}
) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const [currentFocusIndex, setCurrentFocusIndex] = useState(-1);
  const [focusableElements, setFocusableElements] = useState<FocusableElement[]>([]);
  const typeAheadRef = useRef<string>('');
  const typeAheadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update focusable elements
  const updateFocusableElements = useCallback(() => {
    if (!containerRef.current) return;

    const elements = Array.from(
      containerRef.current.querySelectorAll([
        '[tabindex]:not([tabindex="-1"])',
        'button:not([disabled])',
        'a[href]',
        'input:not([disabled])',
        'textarea:not([disabled])',
        'select:not([disabled])',
        '[role="button"]:not([aria-disabled="true"])',
        '[role="menuitem"]:not([aria-disabled="true"])',
        '[role="tab"]:not([aria-disabled="true"])',
        '[role="listitem"][tabindex="0"]'
      ].join(','))
    ) as HTMLElement[];

    const focusableElementsData: FocusableElement[] = elements.map((element, index) => ({
      element,
      index,
      role: element.getAttribute('role') || element.tagName.toLowerCase()
    }));

    setFocusableElements(focusableElementsData);
  }, [containerRef]);

  // Move focus to specific index
  const moveFocusToIndex = useCallback((index: number) => {
    if (focusableElements.length === 0) return;

    let targetIndex = index;

    if (finalConfig.focusWrap) {
      if (targetIndex < 0) targetIndex = focusableElements.length - 1;
      if (targetIndex >= focusableElements.length) targetIndex = 0;
    } else {
      targetIndex = Math.max(0, Math.min(targetIndex, focusableElements.length - 1));
    }

    const targetElement = focusableElements[targetIndex];
    if (targetElement) {
      targetElement.element.focus();
      setCurrentFocusIndex(targetIndex);
    }
  }, [focusableElements, finalConfig.focusWrap]);

  // Type-ahead search
  const handleTypeAhead = useCallback((character: string) => {
    if (!finalConfig.enableTypeAhead) return false;

    typeAheadRef.current += character.toLowerCase();

    // Clear previous timeout
    if (typeAheadTimeoutRef.current) {
      clearTimeout(typeAheadTimeoutRef.current);
    }

    // Find matching element
    const matchingIndex = focusableElements.findIndex((item, index) => {
      if (index <= currentFocusIndex) return false;
      
      const text = item.element.textContent?.toLowerCase() || 
                   item.element.getAttribute('aria-label')?.toLowerCase() || '';
      
      return text.startsWith(typeAheadRef.current);
    });

    if (matchingIndex !== -1) {
      moveFocusToIndex(matchingIndex);
    } else {
      // If no match found after current, search from beginning
      const matchingFromStart = focusableElements.findIndex(item => {
        const text = item.element.textContent?.toLowerCase() || 
                     item.element.getAttribute('aria-label')?.toLowerCase() || '';
        
        return text.startsWith(typeAheadRef.current);
      });

      if (matchingFromStart !== -1) {
        moveFocusToIndex(matchingFromStart);
      }
    }

    // Clear type-ahead after 1 second
    typeAheadTimeoutRef.current = setTimeout(() => {
      typeAheadRef.current = '';
    }, 1000);

    return true;
  }, [finalConfig.enableTypeAhead, focusableElements, currentFocusIndex, moveFocusToIndex]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!containerRef.current?.contains(event.target as Node)) return;

    let handled = false;

    switch (event.key) {
      case 'ArrowDown':
        if (finalConfig.enableArrowKeys) {
          event.preventDefault();
          moveFocusToIndex(currentFocusIndex + 1);
          handled = true;
        }
        break;

      case 'ArrowUp':
        if (finalConfig.enableArrowKeys) {
          event.preventDefault();
          moveFocusToIndex(currentFocusIndex - 1);
          handled = true;
        }
        break;

      case 'Home':
        if (finalConfig.enableHomeEnd) {
          event.preventDefault();
          moveFocusToIndex(0);
          handled = true;
        }
        break;

      case 'End':
        if (finalConfig.enableHomeEnd) {
          event.preventDefault();
          moveFocusToIndex(focusableElements.length - 1);
          handled = true;
        }
        break;

      case 'Tab':
        if (finalConfig.enableTabTrapping) {
          event.preventDefault();
          if (event.shiftKey) {
            moveFocusToIndex(currentFocusIndex - 1);
          } else {
            moveFocusToIndex(currentFocusIndex + 1);
          }
          handled = true;
        }
        break;

      case 'Escape':
        // Clear type-ahead and blur current element
        typeAheadRef.current = '';
        if (typeAheadTimeoutRef.current) {
          clearTimeout(typeAheadTimeoutRef.current);
        }
        (event.target as HTMLElement)?.blur();
        handled = true;
        break;

      default:
        // Handle type-ahead for printable characters
        if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
          handled = handleTypeAhead(event.key);
        }
        break;
    }

    return handled;
  }, [
    containerRef,
    finalConfig,
    currentFocusIndex,
    focusableElements.length,
    moveFocusToIndex,
    handleTypeAhead
  ]);

  // Track focus changes
  const handleFocusIn = useCallback((event: FocusEvent) => {
    if (!containerRef.current?.contains(event.target as Node)) return;

    const targetElement = event.target as HTMLElement;
    const index = focusableElements.findIndex(item => item.element === targetElement);
    
    if (index !== -1) {
      setCurrentFocusIndex(index);
    }
  }, [containerRef, focusableElements]);

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    updateFocusableElements();

    // Use capture phase to handle events before they bubble
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('focusin', handleFocusIn, true);

    // Update focusable elements when DOM changes
    const observer = new MutationObserver(updateFocusableElements);
    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['tabindex', 'disabled', 'aria-disabled']
    });

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('focusin', handleFocusIn, true);
      observer.disconnect();
      
      if (typeAheadTimeoutRef.current) {
        clearTimeout(typeAheadTimeoutRef.current);
      }
    };
  }, [containerRef, handleKeyDown, handleFocusIn, updateFocusableElements]);

  // Announce current focus for screen readers
  const announceFocus = useCallback(() => {
    if (currentFocusIndex === -1 || !focusableElements[currentFocusIndex]) return;

    const currentElement = focusableElements[currentFocusIndex];
    const announcement = `Focused on ${currentElement.role}, ${
      currentElement.index + 1
    } of ${focusableElements.length}`;

    // Create temporary live region for announcement
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.textContent = announcement;
    
    document.body.appendChild(liveRegion);
    
    setTimeout(() => {
      document.body.removeChild(liveRegion);
    }, 1000);
  }, [currentFocusIndex, focusableElements]);

  return {
    currentFocusIndex,
    focusableElements: focusableElements.map(item => item.element),
    moveFocusToIndex,
    announceFocus,
    updateFocusableElements
  };
};