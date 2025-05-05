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
  const drag_start_offset: Position = { x: 0, y: 0 };

  const handle_mouse_down = (event: MouseEvent) => {
    const target_element = event.target as HTMLElement;

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

    is_dragging = true;

    const rect = current_element.getBoundingClientRect();
    drag_start_offset.x = event.clientX - rect.left;
    drag_start_offset.y = event.clientY - rect.top;

    if (on_drag_start) {
      on_drag_start({ x: rect.left, y: rect.top });
    }

    logger.info("Adding drag listeners to", {
      element_ref,
      handle_ref,
    });

    document.addEventListener("mousemove", handle_mouse_move);
    document.addEventListener("mouseup", handle_mouse_up);
    document.body.style.userSelect = "none";

    event.preventDefault();
  };

  const handle_mouse_move = (event: MouseEvent) => {
    logger.info("Mouse move", {
      is_dragging,
      event,
    });

    if (!is_dragging) {
      return;
    }

    const new_position: Position = {
      x: event.clientX - drag_start_offset.x,
      y: event.clientY - drag_start_offset.y,
    };

    on_drag_move(new_position);
  };

  const handle_mouse_up = () => {
    logger.info("Mouse up", {
      is_dragging,
    });

    if (!is_dragging) {
      return;
    }

    is_dragging = false;

    document.removeEventListener("mousemove", handle_mouse_move);
    document.removeEventListener("mouseup", handle_mouse_up);

    document.body.style.userSelect = "";

    if (on_drag_end) {
      on_drag_end();
    }
  };

  const drag_initiator = handle_ref?.current ?? element_ref.current;

  if (drag_initiator) {
    logger.info("Adding drag listeners to", {
      drag_initiator,
    });

    drag_initiator.addEventListener("mousedown", handle_mouse_down);
    if (handle_ref?.current) {
      handle_ref.current.style.cursor = "move";
    }
  }

  return () => {
    if (drag_initiator) {
      logger.info("Removing drag listeners from", {
        drag_initiator,
      });

      drag_initiator.removeEventListener("mousedown", handle_mouse_down);
      if (handle_ref?.current) {
        handle_ref.current.style.cursor = "";
      }
    }
    document.removeEventListener("mousemove", handle_mouse_move);
    document.removeEventListener("mouseup", handle_mouse_up);
    document.body.style.userSelect = "";
  };
};
