
import { useEffect, useCallback } from 'react';

interface UseCanvasKeyboardShortcutsProps {
  isOpen: boolean;
  isEditing: boolean;
  onClose: () => void;
  onPrint?: () => void;
  onToggleEdit: () => void;
}

export const useCanvasKeyboardShortcuts = ({
  isOpen,
  isEditing,
  onClose,
  onPrint,
  onToggleEdit
}: UseCanvasKeyboardShortcutsProps) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      if (isEditing) {
        onToggleEdit();
      } else {
        console.log('Canvas: Escape key pressed, closing canvas');
        onClose();
      }
    } else if (event.ctrlKey && event.key === 'p') {
      event.preventDefault();
      onPrint?.();
    } else if (event.ctrlKey && event.key === 'e') {
      event.preventDefault();
      onToggleEdit();
    }
  }, [onClose, onPrint, isEditing, onToggleEdit]);

  useEffect(() => {
    if (!isOpen) {
      console.log('Canvas: Not open, skipping keyboard shortcuts effect');
      return;
    }

    console.log('Canvas: Setting up keyboard listeners and body overflow');
    
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      console.log('Canvas: Cleaning up keyboard listeners and body overflow');
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);
};
