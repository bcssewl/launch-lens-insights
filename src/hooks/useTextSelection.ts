
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
  const preservedRangeRef = useRef<Range | null>(null);

  const clearSelection = useCallback(() => {
    console.log('useTextSelection: Clearing selection');
    setSelectedText('');
    setSelectionRect(null);
    setIsVisible(false);
    preservedRangeRef.current = null;
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }
  }, []);

  // Function to preserve the current selection
  const preserveSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      preservedRangeRef.current = selection.getRangeAt(0).cloneRange();
      console.log('useTextSelection: Selection preserved');
    }
  }, []);

  // Function to restore the preserved selection
  const restoreSelection = useCallback(() => {
    if (preservedRangeRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(preservedRangeRef.current);
        console.log('useTextSelection: Selection restored');
      }
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

  useEffect(() => {
    console.log('useTextSelection: Setting up event listeners');
    console.log('useTextSelection: Container ref:', containerRef.current);
    
    const handleSelectionChange = () => {
      console.log('useTextSelection: Selection change event fired');
      
      // Clear existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Debounce the selection handling
      debounceTimeoutRef.current = setTimeout(() => {
        const selection = window.getSelection();
        console.log('useTextSelection: Current selection:', selection);
        
        if (!selection || selection.rangeCount === 0) {
          console.log('useTextSelection: No selection found - checking if tooltip is visible');
          // Don't clear if we already have a visible tooltip (user might be interacting with it)
          if (!isVisible) {
            setSelectedText('');
            setSelectionRect(null);
            setIsVisible(false);
            preservedRangeRef.current = null;
          }
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
            if (!isVisible) {
              setSelectedText('');
              setSelectionRect(null);
              setIsVisible(false);
              preservedRangeRef.current = null;
            }
            return;
          }

          // Validate selection bounds
          if (!validateSelectionBounds(range, container)) {
            console.log('useTextSelection: Selection bounds invalid, clearing');
            if (!isVisible) {
              setSelectedText('');
              setSelectionRect(null);
              setIsVisible(false);
              preservedRangeRef.current = null;
            }
            return;
          }
        }

        // Extract text using improved method
        const text = extractTextFromRange(range);
        console.log('useTextSelection: Final extracted text:', `"${text}"`);
        console.log('useTextSelection: Text length:', text.length);
        
        if (!text || text.length < 2) {
          console.log('useTextSelection: Text too short or empty, clearing');
          if (!isVisible) {
            setSelectedText('');
            setSelectionRect(null);
            setIsVisible(false);
            preservedRangeRef.current = null;
          }
          return;
        }

        // Get the bounding rect for the selection
        const rect = range.getBoundingClientRect();
        console.log('useTextSelection: Selection rect:', rect);
        
        // Only show tooltip if rect has valid dimensions
        if (rect.width > 0 && rect.height > 0) {
          console.log('useTextSelection: Setting visible selection');
          
          // Preserve the selection before showing tooltip
          preserveSelection();
          
          setSelectedText(text);
          setSelectionRect(rect);
          setIsVisible(true);
          
          // Restore selection after a brief delay to ensure tooltip is rendered
          setTimeout(() => {
            restoreSelection();
          }, 50);
        } else {
          console.log('useTextSelection: Invalid rect dimensions, clearing');
          if (!isVisible) {
            setSelectedText('');
            setSelectionRect(null);
            setIsVisible(false);
            preservedRangeRef.current = null;
          }
        }
      }, 100);
    };

    // Prevent tooltip from disappearing when clicking on it
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Element;
      if (target && (
        target.closest('[data-selection-tooltip]') || 
        target.closest('[data-tooltip-trigger]')
      )) {
        console.log('useTextSelection: Click on tooltip detected, preserving selection');
        e.preventDefault();
        // Restore selection when interacting with tooltip
        setTimeout(() => {
          restoreSelection();
        }, 10);
        return;
      }
    };

    const handleMouseUp = () => {
      // Small delay to ensure selection is finalized
      setTimeout(() => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0 && !selection.getRangeAt(0).collapsed) {
          preserveSelection();
        }
      }, 10);
    };

    // Listen to selection events
    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mousedown', handleMouseDown, true);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      console.log('useTextSelection: Cleaning up event listeners');
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mousedown', handleMouseDown, true);
      document.removeEventListener('mouseup', handleMouseUp);
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [containerRef, extractTextFromRange, validateSelectionBounds, preserveSelection, restoreSelection, isVisible]);

  return {
    selectedText,
    selectionRect,
    isVisible,
    clearSelection
  };
};
