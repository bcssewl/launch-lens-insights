import { useState, useEffect, useCallback } from 'react';

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

  const clearSelection = useCallback(() => {
    console.log('useTextSelection: Clearing tooltip');
    setSelectedText('');
    setSelectionRect(null);
    setIsVisible(false);
  }, []);

  // Get selection rectangle - handles multi-line selections properly
  const getSelectionRect = useCallback((): DOMRect | null => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return null;
    }

    try {
      const range = selection.getRangeAt(0).cloneRange();
      
      // For multi-line selections, we want to position at the end of the selection
      range.collapse(false); // collapse to end
      
      // Create a temporary span to get accurate positioning
      const tempSpan = document.createElement('span');
      tempSpan.style.position = 'absolute';
      tempSpan.style.visibility = 'hidden';
      tempSpan.style.whiteSpace = 'nowrap';
      
      range.insertNode(tempSpan);
      const rect = tempSpan.getBoundingClientRect();
      
      // Clean up temporary element
      if (tempSpan.parentNode) {
        tempSpan.parentNode.removeChild(tempSpan);
      }
      
      // Ensure we have a valid rectangle
      if (rect.width >= 0 && rect.height >= 0) {
        return rect;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting selection rect:', error);
      return null;
    }
  }, []);

  const isTooltipFocused = useCallback(() => {
    const activeElement = document.activeElement;
    if (!activeElement) return false;
    
    // Check if the active element is within a tooltip
    const tooltipElement = activeElement.closest('[data-selection-tooltip]');
    return !!tooltipElement;
  }, []);

  // Update selection rect on scroll/resize to keep tooltip positioned correctly
  const updateSelectionRect = useCallback(() => {
    if (!isVisible || !selectedText) return;
    
    const newRect = getSelectionRect();
    if (newRect) {
      setSelectionRect(newRect);
    } else {
      // Selection lost, clear everything
      clearSelection();
    }
  }, [isVisible, selectedText, getSelectionRect, clearSelection]);

  useEffect(() => {
    const handleMouseUp = () => {
      // Small delay to let browser finalize selection
      setTimeout(() => {
        const selection = window.getSelection();
        
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
          // Don't clear if tooltip has focus (user is typing in input)
          if (isTooltipFocused()) {
            return;
          }
          clearSelection();
          return;
        }

        const range = selection.getRangeAt(0);
        const text = selection.toString().trim();
        
        if (text.length < 2) {
          // Don't clear if tooltip has focus
          if (isTooltipFocused()) {
            return;
          }
          clearSelection();
          return;
        }

        // Check if selection is within our container
        if (containerRef.current) {
          const container = containerRef.current;
          const startInContainer = container.contains(range.startContainer);
          const endInContainer = container.contains(range.endContainer);
          
          if (!startInContainer || !endInContainer) {
            clearSelection();
            return;
          }
        }

        // Get the selection position for the tooltip
        const rect = getSelectionRect();
        
        if (rect) {
          console.log('useTextSelection: Text selected:', text);
          console.log('useTextSelection: Selection rect:', { 
            top: rect.top, 
            left: rect.left, 
            bottom: rect.bottom, 
            right: rect.right,
            width: rect.width,
            height: rect.height
          });
          
          setSelectedText(text);
          setSelectionRect(rect);
          setIsVisible(true);
        } else {
          console.log('useTextSelection: No valid selection rect found');
          clearSelection();
        }
      }, 10);
    };

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Element;
      
      // Don't clear if clicking on tooltip or its trigger
      if (target && (
        target.closest('[data-selection-tooltip]') || 
        target.closest('[data-tooltip-trigger]')
      )) {
        return;
      }
      
      // Only clear our tooltip state when clicking outside
      if (isVisible) {
        clearSelection();
      }
    };

    const handleSelectionChange = () => {
      // Don't react to selection changes if tooltip has focus
      if (isTooltipFocused()) {
        return;
      }

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        if (isVisible) {
          clearSelection();
        }
      }
    };

    // Listen for mouseup to detect selections
    document.addEventListener('mouseup', handleMouseUp);
    // Listen for mousedown to clear tooltip when clicking elsewhere
    document.addEventListener('mousedown', handleMouseDown);
    // Listen for selection changes
    document.addEventListener('selectionchange', handleSelectionChange);
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [containerRef, isVisible, clearSelection, getSelectionRect, isTooltipFocused]);

  // Add scroll and resize listeners to update position when visible
  useEffect(() => {
    if (!isVisible) return;

    // Listen for scroll events in capture phase to catch all scrollable ancestors
    const handleScroll = () => {
      updateSelectionRect();
    };

    const handleResize = () => {
      updateSelectionRect();
    };

    // Use capture phase to catch scroll events from all ancestors
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isVisible, updateSelectionRect]);

  return {
    selectedText,
    selectionRect,
    isVisible,
    clearSelection
  };
};
