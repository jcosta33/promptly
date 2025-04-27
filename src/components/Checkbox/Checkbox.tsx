import React from "react";
import styles from "./Checkbox.module.css";

export type CheckboxSize = "sm" | "md" | "lg";

export type CheckboxProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> & {
  label?: string;
  size?: CheckboxSize;
  error?: boolean;
  errorMessage?: string;
};

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      size = "md",
      disabled = false,
      className = "",
      id,
      error = false,
      errorMessage,
      ...rest
    },
    ref
  ) => {
    const uniqueId =
      id || `checkbox-${Math.random().toString(36).substring(2, 11)}`;

    return (
      <div className={`${className}`}>
        <label
          className={`${styles.checkboxWrapper} ${styles[size]}`}
          data-promptly-checkbox-disabled={disabled ? "true" : "false"}
        >
          <input
            type="checkbox"
            id={uniqueId}
            ref={ref}
            className={styles.checkboxInput}
            disabled={disabled}
            data-promptly-checkbox-error={error ? "true" : "false"}
            {...rest}
          />
          <span className={styles.checkboxCustom}></span>
          {label && (
            <span
              className={styles.label}
              data-promptly-checkbox-disabled={disabled ? "true" : "false"}
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

Checkbox.displayName = "Checkbox";
