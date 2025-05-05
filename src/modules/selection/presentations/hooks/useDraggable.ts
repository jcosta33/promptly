import { useState, useEffect, useCallback, useRef, RefObject } from "react";
import { add_drag_listeners } from "$/modules/selection/repositories/drag_repository";
import { logger } from "$/utils/logger";

type Position = {
  x: number;
  y: number;
};

type UseDraggableOptions = {
  handleRef?: RefObject<HTMLElement | null>;
};

/**
 * Hook to manage the state for a draggable element.
 * Relies on add_drag_listeners repository for DOM interactions.
 */
export const useDraggable = ({ handleRef }: UseDraggableOptions) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleDragStart = () => {
    logger.log("Drag started");
    setIsDragging(true);
  };

  const handleDragMove = (newPosition: Position) => {
    logger.log("Drag moved", { newPosition });
    setPosition(newPosition);
  };

  const handleDragEnd = () => {
    logger.log("Drag ended");
    setIsDragging(false);
  };

  useEffect(() => {
    if (!elementRef.current) {
      return;
    }

    logger.info("Adding drag listeners to", {
      elementRef,
      handleRef,
    });

    return add_drag_listeners({
      element_ref: elementRef,
      handle_ref: handleRef,
      on_drag_start: handleDragStart,
      on_drag_move: handleDragMove,
      on_drag_end: handleDragEnd,
    });
  }, []);

  return {
    position,
    isDragging,
    elementRef,
  };
};
