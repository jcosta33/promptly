import { logger } from "$/utils/logger";

type AddSelectionListenerParams = {
  callback: (params: {
    selection: Selection | null;
    mouse_position: { x: number; y: number } | null;
  }) => void;
};

/**
 * Add a selection change listener
 *
 * @param callback Function called when selection changes
 * @returns Function to remove the listener
 */
export function add_selection_listener({
  callback,
}: AddSelectionListenerParams): () => void {
  let debounce_timeout: NodeJS.Timeout | null = null;

  const handle_selection_change = (event: MouseEvent) => {
    const promptly_root = document.querySelector("promptly-root");

    if (promptly_root?.contains(event.target as Node)) {
      return;
    }

    if (debounce_timeout !== null) {
      window.clearTimeout(debounce_timeout);
    }

    const mouse_position = {
      x: event.pageX,
      y: event.pageY,
    };

    debounce_timeout = setTimeout(() => {
      const selection = window.getSelection();

      const selection_text = selection?.toString();

      if (!selection_text || selection_text.length === 0) {
        return;
      }

      callback({ selection, mouse_position });

      debounce_timeout = null;
    }, 150);
  };

  const handle_mouse_down = (event: MouseEvent) => {
    const promptly_root = document.querySelector("promptly-root");

    logger.info("Selection: Mouse down", {
      promptly_root,
      event,
    });

    if (!promptly_root?.contains(event.target as Node)) {
      callback({ selection: null, mouse_position: null });
    }
  };

  document.addEventListener("mouseup", handle_selection_change);
  document.addEventListener("mousedown", handle_mouse_down);

  return () => {
    if (debounce_timeout !== null) {
      window.clearTimeout(debounce_timeout);
    }
    document.removeEventListener("mouseup", handle_selection_change);
    document.removeEventListener("mousedown", handle_mouse_down);
  };
}
