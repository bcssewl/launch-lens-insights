
import { useState, useEffect, useCallback } from 'react';

interface UseTextSelectionReturn {
  selectedText: string;
  selectionRect: DOMRect | null;
  isVisible: boolean;
  clearSelection: () => void;
}

export const useTextSelection = (containerRef: React.RefObject<HTMLElement>): UseTextSelectionReturn => {
  const [capturedText, setCapturedText] = useState('');
  const [tooltipRect, setTooltipRect] = useState<DOMRect | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const clearSelection = useCallback(() => {
    console.log('useTextSelection: Clearing selection');
    setCapturedText('');
    setTooltipRect(null);
    setShowTooltip(false);
  }, []);

  useEffect(() => {
    const handleMouseUp = () => {
      // Small delay to let browser finalize selection
      setTimeout(() => {
        const selection = window.getSelection();
        
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
          return;
        }

        const range = selection.getRangeAt(0);
        const text = selection.toString().trim();
        
        if (text.length < 2) {
          return;
        }

        // Check if selection is within our container
        if (containerRef.current) {
          const container = containerRef.current;
          const startInContainer = container.contains(range.startContainer);
          const endInContainer = container.contains(range.endContainer);
          
          // Only proceed if both start and end are in our container
          if (!startInContainer || !endInContainer) {
            return;
          }
        }

        // Get the position for the tooltip
        const rect = range.getBoundingClientRect();
        
        if (rect.width > 0 && rect.height > 0) {
          console.log('useTextSelection: Capturing selection:', text);
          setCapturedText(text);
          setTooltipRect(rect);
          setShowTooltip(true);
        }
      }, 50);
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
      
      // Clear tooltip when clicking elsewhere
      if (showTooltip) {
        clearSelection();
      }
    };

    // Use mouseup instead of selectionchange to avoid interfering with browser selection
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [containerRef, showTooltip, clearSelection]);

  return {
    selectedText: capturedText,
    selectionRect: tooltipRect,
    isVisible: showTooltip,
    clearSelection
  };
};
