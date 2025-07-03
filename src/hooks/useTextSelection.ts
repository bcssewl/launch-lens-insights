
import { useState, useEffect, useCallback, useRef } from 'react';

interface TextSelectionData {
  text: string;
  rect: DOMRect;
  range: Range;
}

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
  const clearTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearSelection = useCallback(() => {
    setSelectedText('');
    setSelectionRect(null);
    setIsVisible(false);
    window.getSelection()?.removeAllRanges();
  }, []);

  useEffect(() => {
    console.log('useTextSelection: Setting up event listeners');
    
    const handleSelectionChange = () => {
      console.log('useTextSelection: Selection changed');
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        console.log('useTextSelection: No selection, clearing');
        clearSelection();
        return;
      }

      const range = selection.getRangeAt(0);
      const text = range.toString().trim();
      console.log('useTextSelection: Selected text:', text);
      
      if (!text || text.length < 3) {
        console.log('useTextSelection: Text too short, clearing');
        clearSelection();
        return;
      }

      // Check if selection is within our container (if container is provided)
      if (containerRef.current) {
        const isInContainer = containerRef.current.contains(range.commonAncestorContainer);
        console.log('useTextSelection: Is in container:', isInContainer);
        if (!isInContainer) {
          clearSelection();
          return;
        }
      }

      const rect = range.getBoundingClientRect();
      console.log('useTextSelection: Setting selection with rect:', rect);
      setSelectedText(text);
      setSelectionRect(rect);
      setIsVisible(true);
    };

    const handleMouseDown = (event: MouseEvent) => {
      console.log('useTextSelection: Mouse down event');
      // Clear any existing timeout
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
        clearTimeoutRef.current = null;
      }

      // Don't clear selection if clicking on tooltip or selected text
      const target = event.target as Element;
      if (target.closest('[data-tooltip-trigger]') || target.closest('[data-selection-tooltip]')) {
        console.log('useTextSelection: Clicked on tooltip, not clearing');
        return;
      }

      // Add a small delay to allow tooltip interactions
      clearTimeoutRef.current = setTimeout(() => {
        const currentSelection = window.getSelection();
        if (!currentSelection || currentSelection.toString().trim() === '') {
          console.log('useTextSelection: Clearing selection after delay');
          clearSelection();
        }
      }, 200); // Increased delay
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      console.log('useTextSelection: Cleaning up event listeners');
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mousedown', handleMouseDown);
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
      }
    };
  }, [containerRef, clearSelection]); // Include dependencies to ensure proper cleanup

  return {
    selectedText,
    selectionRect,
    isVisible,
    clearSelection
  };
};
