import { useEffect, useCallback } from "react";

interface KeyboardShortcutOptions {
  /** Whether to ignore the shortcut if the user is typing in an input or textarea */
  ignoreInputs?: boolean;
  /** Whether to call preventDefault on the event */
  preventDefault?: boolean;
}

/**
 * Hook to handle a keyboard shortcut globally.
 * 
 * @param key The key to listen for (e.g., "/", "k", "Escape")
 * @param callback The function to call when the key is pressed
 * @param options Configuration options for the shortcut
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: KeyboardShortcutOptions = {}
) {
  const { ignoreInputs = true, preventDefault = true } = options;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === key) {
        if (
          ignoreInputs &&
          e.target instanceof HTMLElement &&
          ["INPUT", "TEXTAREA"].includes(e.target.tagName)
        ) {
          return;
        }

        if (preventDefault) {
          e.preventDefault();
        }
        callback();
      }
    },
    [key, callback, ignoreInputs, preventDefault]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
