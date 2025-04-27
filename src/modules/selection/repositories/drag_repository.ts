import { type RefObject } from "react";

type Position = {
    x: number;
    y: number;
};

type DragListenerOptions = {
    elementRef: RefObject<HTMLElement | null>;
    handleRef?: RefObject<HTMLElement | null>;
    onDragStart?: (initialPosition: Position) => void;
    onDragMove: (newPosition: Position) => void;
    onDragEnd?: () => void;
};

/**
 * Adds event listeners to handle dragging an element.
 * Returns a cleanup function to remove the listeners.
 */
export const add_drag_listeners = ({
    elementRef,
    handleRef,
    onDragStart,
    onDragMove,
    onDragEnd,
}: DragListenerOptions): (() => void) => {
    let isDragging = false;
    const dragStartOffset: Position = { x: 0, y: 0 };

    const handleMouseDown = (event: MouseEvent) => {
        const targetElement = event.target as HTMLElement;

        if (
            targetElement.closest(
                'input, textarea, button, select, a[href], [role="button"]'
            )
        ) {
            return;
        }

        const currentElement = elementRef.current;
        if (!currentElement) {
            return;
        }

        isDragging = true;
        const rect = currentElement.getBoundingClientRect();
        dragStartOffset.x = event.clientX - rect.left;
        dragStartOffset.y = event.clientY - rect.top;

        if (onDragStart) {
            onDragStart({ x: rect.left, y: rect.top });
        }

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        document.body.style.userSelect = "none";

        event.preventDefault();
    };

    const handleMouseMove = (event: MouseEvent) => {
        if (!isDragging) {
            return;
        }

        const newPosition: Position = {
            x: event.clientX - dragStartOffset.x,
            y: event.clientY - dragStartOffset.y,
        };
        onDragMove(newPosition);
    };

    const handleMouseUp = () => {
        if (!isDragging) {
            return;
        }

        isDragging = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.userSelect = "";

        if (onDragEnd) {
            onDragEnd();
        }
    };

    const dragInitiator = handleRef?.current ?? elementRef.current;

    if (dragInitiator) {
        dragInitiator.addEventListener("mousedown", handleMouseDown);
        if (handleRef?.current) {
            handleRef.current.style.cursor = "move";
        }
    }

    return () => {
        if (dragInitiator) {
            dragInitiator.removeEventListener("mousedown", handleMouseDown);
            if (handleRef?.current) {
                handleRef.current.style.cursor = "";
            }
        }
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.userSelect = "";
    };
}; 