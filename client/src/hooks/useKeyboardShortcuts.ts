import { useEffect } from 'react';

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
}

/**
 * Custom hook for keyboard shortcuts
 * Supports combinations like Ctrl+N, Ctrl+S, etc.
 * 
 * @example
 * useKeyboardShortcuts([
 *   { key: 'n', ctrlKey: true, action: createNew, description: 'Create new item' },
 *   { key: 's', ctrlKey: true, action: save, description: 'Save' }
 * ]);
 */
export const useKeyboardShortcuts = (shortcuts: ShortcutConfig[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrlKey === undefined || shortcut.ctrlKey === event.ctrlKey;
        const shiftMatch = shortcut.shiftKey === undefined || shortcut.shiftKey === event.shiftKey;
        const altMatch = shortcut.altKey === undefined || shortcut.altKey === event.altKey;
        const metaMatch = shortcut.metaKey === undefined || shortcut.metaKey === event.metaKey;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && metaMatch && keyMatch) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  // Return shortcuts for help dialog
  return shortcuts;
};

/**
 * Global keyboard shortcuts config
 */
export const globalShortcuts = {
  search: { key: 'k', ctrlKey: true, description: 'Global search' },
  help: { key: '?', shiftKey: true, description: 'Show keyboard shortcuts' },
};
