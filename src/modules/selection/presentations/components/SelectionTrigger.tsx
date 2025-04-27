import { FC } from "react";

import { Button } from "$/components/Button/Button";

import styles from "./SelectionTrigger.module.css";

export type SelectionTriggerProps = {
  position: { x: number; y: number };
  onClick: () => void;
};

/**
 * A button that appears when text is selected to trigger the actions overlay
 */
export const SelectionTrigger: FC<SelectionTriggerProps> = ({
  position,
  onClick,
}) => {
  return (
    <div
      className={styles.triggerContainer}
      style={{
        position: "absolute",
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 999999,
      }}
    >
      <Button
        size="sm"
        color="primary"
        onClick={onClick}
        aria-label="Open Promptly"
        className={styles.triggerButton}
      >
        <div className={styles.triggerContent}>
          <span className={styles.triggerText}>S</span>
        </div>
      </Button>
    </div>
  );
};
