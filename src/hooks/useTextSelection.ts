import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTextSelectionReturn {
  selectedText: string;
  selectionRect: DOMRect | null;
  isVisible: boolean;
  clearSelection: () => void;
  tooltipRef: React.RefObject<HTMLDivElement>;
}

export const useTextSelection = (containerRef: React.RefObject<HTMLElement>): UseTextSelectionReturn => {
  const [selectedText, setSelectedText] = useState('');
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const clearSelection = useCallback(() => {
    console.log('useTextSelection: Clearing tooltip');
    setSelectedText('');
    setSelectionRect(null);
    setIsVisible(false);
  }, []);

  // Get selection rectangle at the exact end position where tooltip should appear
  const getSelectionRect = useCallback((): DOMRect | null => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return null;
    }

    try {
      const range = selection.getRangeAt(0);
      
      // Get all rectangles for the selection (handles multi-line selections)
      const rects = range.getClientRects();
      
      if (rects.length > 0) {
        // Use the last rectangle (end of selection) for positioning
        const lastRect = rects[rects.length - 1];
        
        console.log('useTextSelection: Last rect of selection:', {
          top: lastRect.top,
          left: lastRect.left,
          right: lastRect.right,
          bottom: lastRect.bottom,
          width: lastRect.width,
          height: lastRect.height
        });
        
        // Position tooltip at the exact end of the selection
        // Use bottom of text line for vertical positioning (text baseline)
        // Use right edge + small offset for horizontal positioning
        return {
          top: lastRect.bottom - 4, // Position at text baseline, not line top
          left: lastRect.right + 4, // Small offset from end of text
          width: 0,
          height: lastRect.height,
          right: lastRect.right + 4,
          bottom: lastRect.bottom,
          x: lastRect.right + 4,
          y: lastRect.bottom - 4,
          toJSON: () => ({})
        } as DOMRect;
      } else {
        // Fallback to range bounds
        const rangeBounds = range.getBoundingClientRect();
        console.log('useTextSelection: Using range bounds fallback');
        return {
          top: rangeBounds.bottom - 4,
          left: rangeBounds.right + 4,
          width: 0,
          height: rangeBounds.height,
          right: rangeBounds.right + 4,
          bottom: rangeBounds.bottom,
          x: rangeBounds.right + 4,
          y: rangeBounds.bottom - 4,
          toJSON: () => ({})
        } as DOMRect;
      }
    } catch (error) {
      console.error('Error getting selection rect:', error);
      return null;
    }
  }, []);

  // Check if element is inside tooltip
  const isInsideTooltip = useCallback((el: Node | null) => {
    if (!el || !tooltipRef.current) return false;
    return tooltipRef.current.contains(el as Node) || 
           (el as Element)?.closest('[data-selection-tooltip]') !== null;
  }, []);

  // Handle selection changes
  useEffect(() => {
    const handlePointerUp = () => {
      // Small delay to ensure selection is stable
      setTimeout(() => {
        const selection = window.getSelection();
        
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
          // Don't clear if tooltip has focus
          if (isInsideTooltip(document.activeElement)) {
            console.log('useTextSelection: Not clearing - tooltip has focus');
            return;
          }
          clearSelection();
          return;
        }

        const range = selection.getRangeAt(0);
        const text = selection.toString().trim();
        
        if (text.length < 2) {
          // Don't clear if tooltip has focus
          if (isInsideTooltip(document.activeElement)) {
            console.log('useTextSelection: Not clearing - tooltip has focus');
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
          console.log('useTextSelection: Final tooltip rect:', { 
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
      
      // Don't clear if clicking inside tooltip
      if (target && isInsideTooltip(target)) {
        console.log('useTextSelection: Click inside tooltip - ignoring');
        return;
      }
      
      // Only clear our tooltip state when clicking outside
      if (isVisible) {
        console.log('useTextSelection: Click outside - clearing selection');
        clearSelection();
      }
    };

    // Handle selection changes with debouncing
    let selectionChangeTimeout: NodeJS.Timeout;
    const handleSelectionChange = () => {
      clearTimeout(selectionChangeTimeout);
      selectionChangeTimeout = setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
          // Check if we're interacting with the tooltip
          if (isInsideTooltip(document.activeElement)) {
            console.log('useTextSelection: Selection cleared but tooltip has focus');
            return;
          }
          clearSelection();
        }
      }, 50);
    };

    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('selectionchange', handleSelectionChange);
    
    return () => {
      clearTimeout(selectionChangeTimeout);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [containerRef, isVisible, clearSelection, getSelectionRect, isInsideTooltip]);

  // Handle scroll and resize with debouncing
  useEffect(() => {
    if (!isVisible) return;

    let frame: number;
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = getSelectionRect();
        if (rect) {
          console.log('useTextSelection: Updated rect after scroll/resize:', rect);
          setSelectionRect(rect);
        } else {
          clearSelection();
        }
      });
    };

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
    clearSelection,
    tooltipRef
  };
};
