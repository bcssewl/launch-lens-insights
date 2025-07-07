
import { useHotkeys } from 'react-hotkeys-hook';
import { RefObject } from 'react';

interface UseSidebarHotkeysProps {
  /** The search input ref so we can focus it */
  inputRef: RefObject<HTMLInputElement>;
  /** Open/close setter from ChatSearch */
  setIsOpen: (open: boolean) => void;
}

/**
 * Adds ⌘/Ctrl K focus + Esc close only while the sidebar is mounted.
 * Uses react-hotkeys-hook so we don't collide with other page listeners.
 */
export const useSidebarHotkeys = ({ inputRef, setIsOpen }: UseSidebarHotkeysProps) => {
  // Focus search bar
  useHotkeys('meta+k, ctrl+k', (e) => {
    e.preventDefault();
    inputRef.current?.focus();
    setIsOpen(true);
  }, {
    enableOnFormTags: true,
    preventDefault: true
  });

  // Close on Esc
  useHotkeys('esc', () => {
    setIsOpen(false);
    inputRef.current?.blur();
  }, {
    enableOnFormTags: true
  });
};
