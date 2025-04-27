import { FC } from "react";

import styles from "./ProgressBar.module.css";

export type ProgressBarSize = "sm" | "md" | "lg";
export type ProgressBarVariant = "primary" | "secondary" | "tertiary";

export type ProgressBarProps = {
  /**
   * Value between 0 and 100
   */
  value: number;
  /**
   * Max value (default: 100)
   */
  max?: number;
  /**
   * Display value as percentage text inside the progress bar
   */
  showPercentage?: boolean;
  /**
   * Size variant of the progress bar
   */
  size?: ProgressBarSize;
  /**
   * Color variant of the progress bar
   */
  variant?: ProgressBarVariant;
  /**
   * Make the progress bar visually indeterminate with an animation
   */
  indeterminate?: boolean;
  /**
   * Label text displayed above the progress bar
   */
  label?: string;
  /**
   * Helper text displayed below the progress bar
   */
  helperText?: string;
  /**
   * Additional CSS class names
   */
  className?: string;
};

export const ProgressBar: FC<ProgressBarProps> = ({
  value = 0,
  max = 100,
  showPercentage = false,
  size = "md",
  variant = "primary",
  indeterminate = false,
  label,
  helperText,
  className = "",
}) => {
  // Ensure the value is between 0 and max
  const clampedValue = Math.min(Math.max(0, value), max);
  const percentage = Math.round((clampedValue / max) * 100);

  return (
    <div
      className={`${styles.progressBarWrapper} ${className}`}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={`${percentage}%`}
      aria-label={label}
    >
      {label && <div className={styles.label}>{label}</div>}

      <div
        className={styles.progressBarContainer}
        data-promptly-progress-size={size}
        data-promptly-progress-variant={variant}
        data-promptly-progress-indeterminate={indeterminate ? "true" : "false"}
      >
        <div
          className={styles.progressBar}
          style={{ width: indeterminate ? "100%" : `${percentage}%` }}
        >
          {showPercentage && !indeterminate && (
            <span className={styles.percentage}>{percentage}%</span>
          )}
        </div>
      </div>

      {helperText && <div className={styles.helperText}>{helperText}</div>}
    </div>
  );
};

ProgressBar.displayName = "ProgressBar";
