
import { useState, useEffect, useCallback, useRef } from 'react';

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
  const [preservedRange, setPreservedRange] = useState<Range | null>(null);
  const [isPreservingSelection, setIsPreservingSelection] = useState(false);
  const restorationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearSelection = useCallback(() => {
    console.log('useTextSelection: Clearing selection');
    setIsPreservingSelection(false);
    if (restorationIntervalRef.current) {
      clearInterval(restorationIntervalRef.current);
      restorationIntervalRef.current = null;
    }
    setCapturedText('');
    setTooltipRect(null);
    setShowTooltip(false);
    setPreservedRange(null);
    // Clear the browser selection as well
    window.getSelection()?.removeAllRanges();
  }, []);

  const restoreSelection = useCallback(() => {
    if (!isPreservingSelection || !preservedRange || !capturedText) {
      return;
    }

    const selection = window.getSelection();
    if (!selection) return;

    const currentText = selection.toString().trim();
    const hasSelection = selection.rangeCount > 0 && !selection.isCollapsed;

    // Only restore if we don't have the correct selection
    if (!hasSelection || currentText !== capturedText) {
      try {
        console.log('useTextSelection: Restoring selection');
        selection.removeAllRanges();
        
        // Create a fresh clone of the range
        const newRange = preservedRange.cloneRange();
        selection.addRange(newRange);
      } catch (error) {
        console.warn('useTextSelection: Failed to restore selection:', error);
      }
    }
  }, [isPreservingSelection, preservedRange, capturedText]);

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
          
          // Clone the range to preserve it with additional context
          const clonedRange = range.cloneRange();
          
          // Store range info for better restoration
          setPreservedRange(clonedRange);
          setCapturedText(text);
          setTooltipRect(rect);
          setShowTooltip(true);
          setIsPreservingSelection(true);
          
          // Start aggressive restoration interval
          if (restorationIntervalRef.current) {
            clearInterval(restorationIntervalRef.current);
          }
          
          restorationIntervalRef.current = setInterval(() => {
            restoreSelection();
          }, 100); // Check every 100ms
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

    const handleSelectionChange = () => {
      // Restore selection if it gets cleared while we're preserving it
      if (isPreservingSelection) {
        // Small delay to avoid interference with natural selection changes
        setTimeout(() => {
          restoreSelection();
        }, 10);
      }
    };

    // Use mouseup instead of selectionchange to avoid interfering with browser selection
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('selectionchange', handleSelectionChange);
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('selectionchange', handleSelectionChange);
      
      if (restorationIntervalRef.current) {
        clearInterval(restorationIntervalRef.current);
      }
    };
  }, [containerRef, showTooltip, clearSelection, isPreservingSelection, restoreSelection]);

  // Additional effect to handle visibility changes and focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) return;
      
      // Restore selection when tab becomes visible again
      setTimeout(() => {
        restoreSelection();
      }, 100);
    };

    const handleWindowFocus = () => {
      // Restore selection when window gets focus
      setTimeout(() => {
        restoreSelection();
      }, 100);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [restoreSelection]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (restorationIntervalRef.current) {
        clearInterval(restorationIntervalRef.current);
      }
    };
  }, []);

  return {
    selectedText: capturedText,
    selectionRect: tooltipRect,
    isVisible: showTooltip,
    clearSelection
  };
};
