import { logger } from "$/utils/logger";
import { type RefObject } from "react";

type Position = {
  x: number;
  y: number;
};

type DragListenerOptions = {
  element_ref: RefObject<HTMLElement | null>;
  handle_ref?: RefObject<HTMLElement | null>;
  on_drag_start?: (initial_position: Position) => void;
  on_drag_move: (new_position: Position) => void;
  on_drag_end?: () => void;
};

/**
 * Adds event listeners to handle dragging an element.
 * Returns a cleanup function to remove the listeners.
 */
export const add_drag_listeners = ({
  element_ref,
  handle_ref,
  on_drag_start,
  on_drag_move,
  on_drag_end,
}: DragListenerOptions): (() => void) => {
  let is_dragging = false;
  let initial_offset: Position | null = null;

  const handle_mouse_down = (event: MouseEvent) => {
    const target_element = event.target as HTMLElement;

    // Ignore clicks on interactive elements within the draggable element
    if (
      target_element.closest(
        'input, textarea, button, select, a[href], [role="button"]'
      )
    ) {
      return;
    }

    const current_element = element_ref.current;
    if (!current_element) {
      return;
    }

    // Determine the element initiating the drag (handle or the element itself)
    const handle_element = handle_ref?.current;

    // Only start drag if the mousedown event occurred on the drag initiator
    if (handle_element && !handle_element.contains(target_element)) {
      // If a handle exists, check if the click was on the handle or its children
      // If the click is within the main element but *not* the handle, ignore drag.
      if (current_element.contains(target_element)) {
        return;
      }
      // If click is outside both handle and element (shouldn't happen often), ignore.
      return;
    } else if (!handle_element && !current_element.contains(target_element)) {
      // If no handle, check if the click was on the element itself or its children
      return;
    }

    is_dragging = true;

    const element_rect = current_element.getBoundingClientRect();
    // Calculate offset relative to the element's top-left corner
    initial_offset = {
      x: event.clientX - element_rect.left,
      y: event.clientY - element_rect.top,
    };

    // Pass the initial *click* position (viewport coordinates) to the start handler if needed
    const start_position: Position = {
      x: event.pageX,
      y: event.pageY,
    };

    if (on_drag_start) {
      on_drag_start(start_position);
    }

    logger.info("Drag Start", { element_ref, handle_ref, initial_offset });

    document.addEventListener("mousemove", handle_mouse_move);
    document.addEventListener("mouseup", handle_mouse_up);
    document.body.style.userSelect = "none"; // Prevent text selection during drag

    event.preventDefault(); // Prevent default drag behavior or text selection
  };

  const handle_mouse_move = (event: MouseEvent) => {
    if (!is_dragging || !initial_offset) {
      return;
    }

    // Calculate the desired top-left position of the element
    const new_position: Position = {
      x: event.pageX - initial_offset.x,
      y: event.pageY - initial_offset.y,
    };

    logger.debug("Drag Move", { new_position });
    on_drag_move(new_position);
  };

  const handle_mouse_up = () => {
    if (!is_dragging) {
      return;
    }
    logger.info("Drag End");

    is_dragging = false;
    initial_offset = null;

    document.removeEventListener("mousemove", handle_mouse_move);
    document.removeEventListener("mouseup", handle_mouse_up);
    document.body.style.userSelect = ""; // Restore text selection

    if (on_drag_end) {
      on_drag_end();
    }
  };

  const drag_initiator = handle_ref?.current ?? element_ref.current;

  if (drag_initiator) {
    logger.info("Attaching drag listeners", { drag_initiator });
    drag_initiator.addEventListener("mousedown", handle_mouse_down);
    // Apply move cursor only to the specific handle if provided, else the whole element
    const cursor_target = handle_ref?.current ?? drag_initiator;
    cursor_target.style.cursor = "move";
  }

  // Cleanup function
  return () => {
    if (drag_initiator) {
      logger.info("Removing drag listeners", { drag_initiator });
      drag_initiator.removeEventListener("mousedown", handle_mouse_down);
      // Reset cursor on cleanup using the same logic as application
      const cursor_target = handle_ref?.current ?? drag_initiator;
      cursor_target.style.cursor = "";
    }
    // Ensure global listeners are removed even if initiator is gone or changed
    document.removeEventListener("mousemove", handle_mouse_move);
    document.removeEventListener("mouseup", handle_mouse_up);
    // Reset body style potentially altered by drag
    // Check is_dragging state before resetting, only reset if drag was interrupted mid-flight by unmount
    if (is_dragging) {
      document.body.style.userSelect = "";
    }
  };
};
