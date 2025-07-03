
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTextSelectionReturn {
  selectedText: string;
  selectionRect: DOMRect | null;
  isVisible: boolean;
  clearSelection: () => void;
}

export const useTextSelection = (containerRef: React.RefObject<HTMLElement>): UseTextSelectionReturn => {
  const [selectedText, setSelectedText] = useState('');
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stabilityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastValidSelectionRef = useRef<{ text: string; rect: DOMRect } | null>(null);

  const clearSelection = useCallback(() => {
    console.log('useTextSelection: Clearing selection');
    setSelectedText('');
    setSelectionRect(null);
    setIsVisible(false);
    lastValidSelectionRef.current = null;
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }
  }, []);

  // Function to extract text from a range more accurately
  const extractTextFromRange = useCallback((range: Range): string => {
    // Create a temporary container to get clean text
    const tempDiv = document.createElement('div');
    try {
      // Clone the range contents to avoid modifying the original
      const clonedContents = range.cloneContents();
      tempDiv.appendChild(clonedContents);
      
      // Get text content and clean it up
      let text = tempDiv.textContent || tempDiv.innerText || '';
      
      // Remove extra whitespace and normalize
      text = text.replace(/\s+/g, ' ').trim();
      
      console.log('useTextSelection: Extracted text:', `"${text}"`);
      return text;
    } finally {
      // Clean up temporary element
      tempDiv.remove();
    }
  }, []);

  // Function to validate if the selection is within visual bounds
  const validateSelectionBounds = useCallback((range: Range, containerElement: HTMLElement): boolean => {
    try {
      const rangeRect = range.getBoundingClientRect();
      const containerRect = containerElement.getBoundingClientRect();
      
      // Check if the selection rectangle is within reasonable bounds of the container
      const isWithinContainer = (
        rangeRect.left >= containerRect.left - 10 &&
        rangeRect.right <= containerRect.right + 10 &&
        rangeRect.top >= containerRect.top - 10 &&
        rangeRect.bottom <= containerRect.bottom + 10
      );
      
      console.log('useTextSelection: Selection bounds validation:', {
        rangeRect: {
          left: rangeRect.left,
          right: rangeRect.right,
          top: rangeRect.top,
          bottom: rangeRect.bottom,
          width: rangeRect.width,
          height: rangeRect.height
        },
        containerRect: {
          left: containerRect.left,
          right: containerRect.right,
          top: containerRect.top,
          bottom: containerRect.bottom
        },
        isWithinContainer
      });
      
      return isWithinContainer && rangeRect.width > 0 && rangeRect.height > 0;
    } catch (error) {
      console.error('useTextSelection: Error validating selection bounds:', error);
      return false;
    }
  }, []);

  // Function to normalize selection to avoid partial word selections
  const normalizeSelection = useCallback((range: Range): Range | null => {
    try {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return null;

      // Get the original range
      const originalRange = range.cloneRange();
      
      // Try to expand selection to complete words if it seems like a partial selection
      const text = originalRange.toString();
      if (text.length < 3) {
        // For very short selections, don't normalize
        return originalRange;
      }

      // Check if selection starts or ends in the middle of a word
      const startContainer = originalRange.startContainer;
      const endContainer = originalRange.endContainer;
      
      if (startContainer.nodeType === Node.TEXT_NODE && endContainer.nodeType === Node.TEXT_NODE) {
        const startText = startContainer.textContent || '';
        const endText = endContainer.textContent || '';
        
        // Check if we're starting in the middle of a word
        const startOffset = originalRange.startOffset;
        const endOffset = originalRange.endOffset;
        
        // Don't modify if selection seems intentional (starts at word boundary)
        const startsAtWordBoundary = startOffset === 0 || /\s/.test(startText[startOffset - 1]);
        const endsAtWordBoundary = endOffset === endText.length || /\s/.test(endText[endOffset]);
        
        if (startsAtWordBoundary && endsAtWordBoundary) {
          return originalRange;
        }
      }
      
      return originalRange;
    } catch (error) {
      console.error('useTextSelection: Error normalizing selection:', error);
      return range;
    }
  }, []);

  useEffect(() => {
    console.log('useTextSelection: Setting up event listeners');
    console.log('useTextSelection: Container ref:', containerRef.current);
    
    const handleSelectionChange = () => {
      console.log('useTextSelection: Selection change event fired');
      
      // Clear existing timeouts
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (stabilityTimeoutRef.current) {
        clearTimeout(stabilityTimeoutRef.current);
      }

      // Debounce the selection handling
      debounceTimeoutRef.current = setTimeout(() => {
        const selection = window.getSelection();
        console.log('useTextSelection: Current selection:', selection);
        
        if (!selection || selection.rangeCount === 0) {
          console.log('useTextSelection: No selection found');
          // Don't clear immediately, wait a bit to see if it's just a temporary state
          stabilityTimeoutRef.current = setTimeout(() => {
            if (lastValidSelectionRef.current) {
              console.log('useTextSelection: Restoring last valid selection');
              setSelectedText(lastValidSelectionRef.current.text);
              setSelectionRect(lastValidSelectionRef.current.rect);
              setIsVisible(true);
            } else {
              setSelectedText('');
              setSelectionRect(null);
              setIsVisible(false);
            }
          }, 100);
          return;
        }

        const range = selection.getRangeAt(0);
        console.log('useTextSelection: Range details:', {
          collapsed: range.collapsed,
          startContainer: range.startContainer,
          endContainer: range.endContainer,
          startOffset: range.startOffset,
          endOffset: range.endOffset
        });

        // Skip if range is collapsed (no actual selection)
        if (range.collapsed) {
          console.log('useTextSelection: Range is collapsed');
          // Use stability timeout here too
          stabilityTimeoutRef.current = setTimeout(() => {
            if (lastValidSelectionRef.current) {
              console.log('useTextSelection: Keeping last valid selection after collapse');
              setSelectedText(lastValidSelectionRef.current.text);
              setSelectionRect(lastValidSelectionRef.current.rect);
              setIsVisible(true);
            } else {
              setSelectedText('');
              setSelectionRect(null);
              setIsVisible(false);
            }
          }, 100);
          return;
        }

        // Check if selection is within our container
        if (containerRef.current) {
          const container = containerRef.current;
          const commonAncestor = range.commonAncestorContainer;
          
          // More thorough container check
          const isInContainer = container.contains(commonAncestor) || 
                               container.contains(range.startContainer) || 
                               container.contains(range.endContainer) ||
                               container === commonAncestor ||
                               container === range.startContainer ||
                               container === range.endContainer;
          
          console.log('useTextSelection: Container check:', {
            container: container,
            commonAncestor: commonAncestor,
            isInContainer: isInContainer,
            startContainer: range.startContainer,
            endContainer: range.endContainer
          });
          
          if (!isInContainer) {
            console.log('useTextSelection: Selection not in container, clearing');
            setSelectedText('');
            setSelectionRect(null);
            setIsVisible(false);
            lastValidSelectionRef.current = null;
            return;
          }

          // Validate selection bounds
          if (!validateSelectionBounds(range, container)) {
            console.log('useTextSelection: Selection bounds invalid, clearing');
            setSelectedText('');
            setSelectionRect(null);
            setIsVisible(false);
            lastValidSelectionRef.current = null;
            return;
          }
        }

        // Normalize the selection
        const normalizedRange = normalizeSelection(range);
        if (!normalizedRange) {
          console.log('useTextSelection: Failed to normalize selection, clearing');
          setSelectedText('');
          setSelectionRect(null);
          setIsVisible(false);
          lastValidSelectionRef.current = null;
          return;
        }

        // Extract text using improved method
        const text = extractTextFromRange(normalizedRange);
        console.log('useTextSelection: Final extracted text:', `"${text}"`);
        console.log('useTextSelection: Text length:', text.length);
        
        if (!text || text.length < 2) {
          console.log('useTextSelection: Text too short or empty, clearing');
          setSelectedText('');
          setSelectionRect(null);
          setIsVisible(false);
          lastValidSelectionRef.current = null;
          return;
        }

        // Get the bounding rect for the selection
        const rect = normalizedRange.getBoundingClientRect();
        console.log('useTextSelection: Selection rect:', rect);
        
        // Only show tooltip if rect has valid dimensions
        if (rect.width > 0 && rect.height > 0) {
          console.log('useTextSelection: Setting visible selection');
          
          // Store as last valid selection
          lastValidSelectionRef.current = { text, rect };
          
          setSelectedText(text);
          setSelectionRect(rect);
          setIsVisible(true);
        } else {
          console.log('useTextSelection: Invalid rect dimensions, clearing');
          setSelectedText('');
          setSelectionRect(null);
          setIsVisible(false);
          lastValidSelectionRef.current = null;
        }
      }, 150); // Slightly shorter debounce for better responsiveness
    };

    // Prevent tooltip from disappearing when clicking on it
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Element;
      if (target && (
        target.closest('[data-selection-tooltip]') || 
        target.closest('[data-tooltip-trigger]')
      )) {
        console.log('useTextSelection: Click on tooltip detected, preventing selection clear');
        e.preventDefault();
        return;
      }
    };

    // Listen to selectionchange events
    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mousedown', handleMouseDown, true);
    
    return () => {
      console.log('useTextSelection: Cleaning up event listeners');
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mousedown', handleMouseDown, true);
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (stabilityTimeoutRef.current) {
        clearTimeout(stabilityTimeoutRef.current);
      }
    };
  }, [containerRef, extractTextFromRange, validateSelectionBounds, normalizeSelection]);

  return {
    selectedText,
    selectionRect,
    isVisible,
    clearSelection
  };
};
