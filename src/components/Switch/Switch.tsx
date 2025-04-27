import React from "react";
import styles from "./Switch.module.css";

export type SwitchSize = "sm" | "md" | "lg";

export type SwitchProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size" | "type"
> & {
  label?: string;
  size?: SwitchSize;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  labelPosition?: "left" | "right";
};

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      label,
      size = "md",
      disabled = false,
      checked = false,
      onChange,
      className = "",
      id,
      error = false,
      errorMessage,
      labelPosition = "right",
      ...rest
    },
    ref
  ) => {
    const uniqueId =
      id || `switch-${Math.random().toString(36).substring(2, 11)}`;

    return (
      <div className={`${styles.switchContainer} ${className}`}>
        <label
          className={`
            ${styles.switchWrapper} 
            ${styles[`label-${labelPosition}`]}
          `}
          data-promptly-switch-size={size}
          data-promptly-switch-disabled={disabled ? "true" : "false"}
        >
          {label && labelPosition === "left" && (
            <span
              className={styles.label}
              data-promptly-switch-disabled={disabled ? "true" : "false"}
            >
              {label}
            </span>
          )}

          <div
            className={styles.switchControl}
            data-promptly-switch-checked={checked ? "true" : "false"}
            data-promptly-switch-disabled={disabled ? "true" : "false"}
            data-promptly-switch-error={error ? "true" : "false"}
          >
            <input
              type="checkbox"
              id={uniqueId}
              ref={ref}
              checked={checked}
              onChange={onChange}
              disabled={disabled}
              className={styles.switchInput}
              {...rest}
            />
            <div className={styles.switchTrack}>
              <div className={styles.switchThumb}></div>
              <div className={styles.switchLabels}>
                <span className={styles.switchOn}>ON</span>
                <span className={styles.switchOff}>OFF</span>
              </div>
            </div>
          </div>

          {label && labelPosition === "right" && (
            <span
              className={styles.label}
              data-promptly-switch-disabled={disabled ? "true" : "false"}
            >
              {label}
            </span>
          )}
        </label>

        {error && errorMessage && (
          <div className={styles.errorMessage}>{errorMessage}</div>
        )}
      </div>
    );
  }
);

Switch.displayName = "Switch";
