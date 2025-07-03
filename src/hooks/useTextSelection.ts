
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
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearSelection = useCallback(() => {
    console.log('useTextSelection: Clearing selection');
    setSelectedText('');
    setSelectionRect(null);
    setIsVisible(false);
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }
  }, []);

  useEffect(() => {
    console.log('useTextSelection: Setting up event listeners');
    console.log('useTextSelection: Container ref:', containerRef.current);
    
    const handleSelectionChange = () => {
      console.log('useTextSelection: Selection change event fired');
      
      // Clear existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Debounce the selection handling to avoid rapid updates
      debounceTimeoutRef.current = setTimeout(() => {
        const selection = window.getSelection();
        console.log('useTextSelection: Current selection:', selection);
        
        if (!selection || selection.rangeCount === 0) {
          console.log('useTextSelection: No selection found, clearing');
          setSelectedText('');
          setSelectionRect(null);
          setIsVisible(false);
          return;
        }

        const range = selection.getRangeAt(0);
        const text = range.toString().trim();
        console.log('useTextSelection: Selected text:', `"${text}"`);
        console.log('useTextSelection: Text length:', text.length);
        
        if (!text || text.length < 2) {
          console.log('useTextSelection: Text too short, clearing');
          setSelectedText('');
          setSelectionRect(null);
          setIsVisible(false);
          return;
        }

        // Check if selection is within our container
        if (containerRef.current) {
          const container = containerRef.current;
          const commonAncestor = range.commonAncestorContainer;
          
          // Check if the selection is within the container (including nested elements)
          const isInContainer = container.contains(commonAncestor) || 
                               container.contains(range.startContainer) || 
                               container.contains(range.endContainer);
          
          console.log('useTextSelection: Container check:', {
            container: container,
            commonAncestor: commonAncestor,
            isInContainer: isInContainer,
            startContainer: range.startContainer,
            endContainer: range.endContainer
          });
          
          if (!isInContainer) {
            console.log('useTextSelection: Selection not in container, clearing');
            setSelectedText('');
            setSelectionRect(null);
            setIsVisible(false);
            return;
          }
        }

        // Get the bounding rect for the selection
        const rect = range.getBoundingClientRect();
        console.log('useTextSelection: Selection rect:', rect);
        
        // Only show tooltip if rect has valid dimensions
        if (rect.width > 0 && rect.height > 0) {
          console.log('useTextSelection: Setting visible selection');
          setSelectedText(text);
          setSelectionRect(rect);
          setIsVisible(true);
        } else {
          console.log('useTextSelection: Invalid rect dimensions, clearing');
          setSelectedText('');
          setSelectionRect(null);
          setIsVisible(false);
        }
      }, 150); // Increased debounce slightly for better stability
    };

    // Listen to selectionchange events
    document.addEventListener('selectionchange', handleSelectionChange);
    
    return () => {
      console.log('useTextSelection: Cleaning up event listeners');
      document.removeEventListener('selectionchange', handleSelectionChange);
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [containerRef]);

  return {
    selectedText,
    selectionRect,
    isVisible,
    clearSelection
  };
};
