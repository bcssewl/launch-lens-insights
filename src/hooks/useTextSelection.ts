
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

  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      clearSelection();
      return;
    }

    const range = selection.getRangeAt(0);
    const text = range.toString().trim();
    
    if (!text || text.length < 3) {
      clearSelection();
      return;
    }

    // Check if selection is within our container
    if (containerRef.current && !containerRef.current.contains(range.commonAncestorContainer)) {
      clearSelection();
      return;
    }

    const rect = range.getBoundingClientRect();
    setSelectedText(text);
    setSelectionRect(rect);
    setIsVisible(true);
  }, [clearSelection]); // Removed containerRef from dependencies to stabilize

  const handleMouseDown = useCallback((event: MouseEvent) => {
    // Clear any existing timeout
    if (clearTimeoutRef.current) {
      clearTimeout(clearTimeoutRef.current);
      clearTimeoutRef.current = null;
    }

    // Don't clear selection if clicking on tooltip or selected text
    const target = event.target as Element;
    if (target.closest('[data-tooltip-trigger]') || target.closest('[data-selection-tooltip]')) {
      return;
    }

    // Add a small delay to allow tooltip interactions
    clearTimeoutRef.current = setTimeout(() => {
      const currentSelection = window.getSelection();
      if (!currentSelection || currentSelection.toString().trim() === '') {
        clearSelection();
      }
    }, 150);
  }, [clearSelection]);

  useEffect(() => {
    const handleSelectionChangeStable = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        clearSelection();
        return;
      }

      const range = selection.getRangeAt(0);
      const text = range.toString().trim();
      
      if (!text || text.length < 3) {
        clearSelection();
        return;
      }

      // Check if selection is within our container
      if (containerRef.current && !containerRef.current.contains(range.commonAncestorContainer)) {
        clearSelection();
        return;
      }

      const rect = range.getBoundingClientRect();
      setSelectedText(text);
      setSelectionRect(rect);
      setIsVisible(true);
    };

    const handleMouseDownStable = (event: MouseEvent) => {
      // Clear any existing timeout
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
        clearTimeoutRef.current = null;
      }

      // Don't clear selection if clicking on tooltip or selected text
      const target = event.target as Element;
      if (target.closest('[data-tooltip-trigger]') || target.closest('[data-selection-tooltip]')) {
        return;
      }

      // Add a small delay to allow tooltip interactions
      clearTimeoutRef.current = setTimeout(() => {
        const currentSelection = window.getSelection();
        if (!currentSelection || currentSelection.toString().trim() === '') {
          clearSelection();
        }
      }, 150);
    };

    document.addEventListener('selectionchange', handleSelectionChangeStable);
    document.addEventListener('mousedown', handleMouseDownStable);
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChangeStable);
      document.removeEventListener('mousedown', handleMouseDownStable);
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
      }
    };
  }, []); // Empty dependency array to prevent re-registration

  return {
    selectedText,
    selectionRect,
    isVisible,
    clearSelection
  };
};
