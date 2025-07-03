
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
  const tooltipRef = useRef<HTMLElement | null>(null);

  const clearSelection = useCallback(() => {
    console.log('useTextSelection: Clearing tooltip');
    setSelectedText('');
    setSelectionRect(null);
    setIsVisible(false);
  }, []);

  // Get selection rectangle using collapsed caret position for ChatGPT-like behavior
  const getSelectionRect = useCallback((): DOMRect | null => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return null;
    }

    try {
      const range = selection.getRangeAt(0).cloneRange();
      range.collapse(false); // collapse to the end caret
      const rects = range.getClientRects();
      const caretRect = rects[0]; // tiny box at the end of the selection
      
      if (caretRect && caretRect.width >= 0 && caretRect.height >= 0) {
        // Create a DOMRect-like object positioned at the caret
        const rect = {
          top: caretRect.top,
          left: caretRect.left,
          width: 0,
          height: 0,
          right: caretRect.right,
          bottom: caretRect.bottom,
          x: caretRect.left,
          y: caretRect.top,
          toJSON: () => ({})
        } as DOMRect;
        
        return rect;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting selection rect:', error);
      return null;
    }
  }, []);

  // Simplified focus check using direct ref
  const isInsideTooltip = useCallback((el: Node | null) => {
    return tooltipRef.current?.contains(el as Node) || false;
  }, []);

  // Debounced clear logic to avoid flicker
  const scheduleClear = useCallback(() => {
    requestAnimationFrame(() => {
      if (!isInsideTooltip(document.activeElement)) {
        clearSelection();
      }
    });
  }, [isInsideTooltip, clearSelection]);

  // Use pointerup instead of mouseup for better performance
  useEffect(() => {
    const handlePointerUp = () => {
      // Run in next micro-task; no timeout needed
      Promise.resolve().then(() => {
        const selection = window.getSelection();
        
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
          // Don't clear if tooltip has focus (user is typing in input)
          if (isInsideTooltip(document.activeElement)) {
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

        // Get the selection position for the tooltip using caret position
        const rect = getSelectionRect();
        
        if (rect) {
          console.log('useTextSelection: Text selected:', text);
          console.log('useTextSelection: Caret rect:', { 
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
      
      // Don't clear if clicking inside tooltip
      if (target && isInsideTooltip(target)) {
        return;
      }
      
      // Only clear our tooltip state when clicking outside
      if (isVisible) {
        clearSelection();
      }
    };

    // Debounced selectionchange handler
    let hideFrame: number;
    const handleSelectionChange = () => {
      cancelAnimationFrame(hideFrame);
      hideFrame = requestAnimationFrame(() => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
          // Check if we're interacting with the tooltip
          if (isInsideTooltip(document.activeElement)) {
            return;
          }
          
          clearSelection();
        }
      });
    };

    // Listen for pointerup to detect selections
    document.addEventListener('pointerup', handlePointerUp);
    // Listen for mousedown to clear tooltip when clicking elsewhere
    document.addEventListener('mousedown', handleMouseDown);
    // Listen for selection changes with debouncing
    document.addEventListener('selectionchange', handleSelectionChange);
    
    return () => {
      cancelAnimationFrame(hideFrame);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [containerRef, isVisible, clearSelection, getSelectionRect, isInsideTooltip, scheduleClear]);

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
