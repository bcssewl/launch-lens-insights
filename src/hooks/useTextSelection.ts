
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

  // Get selection rectangle without DOM mutations - more performant
  const getSelectionRect = useCallback((): DOMRect | null => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return null;
    }

    try {
      const range = selection.getRangeAt(0);
      const rangeRect = range.getBoundingClientRect();
      
      // Create a DOMRect-like object positioned at the end of selection
      const rect = {
        top: rangeRect.bottom,
        left: rangeRect.left,
        width: 0,
        height: 0,
        right: rangeRect.right,
        bottom: rangeRect.bottom,
        x: rangeRect.left,
        y: rangeRect.bottom,
        toJSON: () => ({})
      } as DOMRect;
      
      // Ensure we have a valid rectangle
      if (rangeRect.width >= 0 && rangeRect.height >= 0) {
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

  // Update selection rect on scroll/resize with debouncing
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

  // Use pointerup instead of mouseup for better performance
  useEffect(() => {
    const handlePointerUp = () => {
      // Run in next micro-task; no timeout needed
      Promise.resolve().then(() => {
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
      });
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

    // Clear only when the selection is really gone
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

    // Listen for pointerup to detect selections
    document.addEventListener('pointerup', handlePointerUp);
    // Listen for mousedown to clear tooltip when clicking elsewhere
    document.addEventListener('mousedown', handleMouseDown);
    // Listen for selection changes
    document.addEventListener('selectionchange', handleSelectionChange);
    
    return () => {
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [containerRef, isVisible, clearSelection, getSelectionRect, isTooltipFocused]);

  // Debounce scroll and resize listeners with requestAnimationFrame
  useEffect(() => {
    if (!isVisible) return;

    let frame: number;
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = getSelectionRect();
        rect ? setSelectionRect(rect) : clearSelection();
      });
    };

    // Use capture phase to catch scroll events from all ancestors
    window.addEventListener('scroll', sync, true);
    window.addEventListener('resize', sync);
    
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', sync, true);
      window.removeEventListener('resize', sync);
    };
  }, [isVisible, getSelectionRect, clearSelection]);

  return {
    selectedText,
    selectionRect,
    isVisible,
    clearSelection
  };
};
