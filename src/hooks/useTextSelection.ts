
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
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return null;
    }

    try {
      // Use the END of the selection range for natural positioning
      const range = selection.getRangeAt(0).cloneRange();
      range.collapse(false); // collapse to end-caret

      // For multi-line selections we want just the caret line
      const rects = range.getClientRects();
      if (!rects.length) {
        // Fallback to getBoundingClientRect if getClientRects fails
        const boundingRect = range.getBoundingClientRect();
        if (boundingRect.width > 0 || boundingRect.height > 0) {
          return boundingRect;
        }
        return null;
      }

      const caretRect = rects[0]; // small sliver around the caret
      
      // Ensure we have a valid rectangle
      if (caretRect.width >= 0 && caretRect.height >= 0) {
        return caretRect;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting caret rect:', error);
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

        // Get the caret position for the tooltip
        const caretRect = getCaretRect();
        
        if (caretRect) {
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
        } else {
          console.log('useTextSelection: No valid caret rect found');
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
  }, [containerRef, isVisible, clearSelection, getCaretRect, isTooltipFocused]);

  return {
    selectedText,
    selectionRect,
    isVisible,
    clearSelection
  };
};
