import { useState, useEffect, useCallback, useRef, RefObject } from "react";
import { add_drag_listeners } from "$/modules/selection/repositories/drag_repository";

type Position = {
    x: number;
    y: number;
}

type UseDraggableOptions = {
    initialPosition?: Position;
    handleRef?: RefObject<HTMLElement | null>;
}

/**
 * Hook to manage the state for a draggable element.
 * Relies on add_drag_listeners repository for DOM interactions.
 */
export const useDraggable = ({
    initialPosition = { x: 0, y: 0 },
    handleRef,
}: UseDraggableOptions) => {
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState<Position>(initialPosition);
    const elementRef = useRef<HTMLDivElement>(null);

    const handleDragStart = () => {
        setIsDragging(true);
    };

    const handleDragMove = (newPosition: Position) => {
        setPosition(newPosition);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (!elementRef.current) {
            return;
        }

        return add_drag_listeners({
            elementRef,
            handleRef,
            onDragStart: handleDragStart,
            onDragMove: handleDragMove,
            onDragEnd: handleDragEnd,
        });

    }, [elementRef, handleRef, handleDragStart, handleDragMove, handleDragEnd]);

    return {
        position,
        isDragging,
        elementRef,
    };
}; 