
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

  const getCaretRect = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    // Use the END of the selection range for natural positioning
    const range = selection.getRangeAt(0).cloneRange();
    range.collapse(false); // collapse to end-caret

    // For multi-line selections we want just the caret line
    const rects = range.getClientRects();
    if (!rects.length) return null;

    return rects[0]; // small sliver around the caret
  }, []);

  useEffect(() => {
    const handleMouseUp = () => {
      // Small delay to let browser finalize selection
      setTimeout(() => {
        const selection = window.getSelection();
        
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
          clearSelection();
          return;
        }

        const range = selection.getRangeAt(0);
        const text = selection.toString().trim();
        
        if (text.length < 2) {
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

        // Get the caret position for the tooltip
        const caretRect = getCaretRect();
        
        if (caretRect && caretRect.width >= 0 && caretRect.height >= 0) {
          console.log('useTextSelection: Text selected:', text);
          console.log('useTextSelection: Caret rect:', { 
            top: caretRect.top, 
            left: caretRect.left, 
            bottom: caretRect.bottom, 
            right: caretRect.right,
            width: caretRect.width,
            height: caretRect.height
          });
          
          setSelectedText(text);
          setSelectionRect(caretRect);
          setIsVisible(true);
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

    // Listen for mouseup to detect selections
    document.addEventListener('mouseup', handleMouseUp);
    // Listen for mousedown to clear tooltip when clicking elsewhere
    document.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [containerRef, isVisible, clearSelection, getCaretRect]);

  return {
    selectedText,
    selectionRect,
    isVisible,
    clearSelection
  };
};
