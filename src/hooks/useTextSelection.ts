
import { useState, useEffect, useCallback } from 'react';

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
  }, [containerRef, clearSelection]);

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mousedown', clearSelection);
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mousedown', clearSelection);
    };
  }, [handleSelectionChange, clearSelection]);

  return {
    selectedText,
    selectionRect,
    isVisible,
    clearSelection
  };
};
