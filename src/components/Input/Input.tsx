import { forwardRef, type ReactNode, type InputHTMLAttributes } from "react";
import styles from "./Input.module.css";

export type InputSize = "sm" | "md" | "lg";

export type InputProps = {
  label?: string;
  size?: InputSize;
  error?: boolean;
  errorMessage?: string;
  fullWidth?: boolean;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "size">;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      size = "md",
      error = false,
      errorMessage,
      fullWidth = false,
      startAdornment,
      endAdornment,
      className = "",
      disabled = false,
      id,
      ...rest
    },
    ref
  ) => {
    const uniqueId =
      id || `input-${Math.random().toString(36).substring(2, 11)}`;

    return (
      <div
        className={`${styles.inputWrapper} ${fullWidth ? styles.fullWidth : ""} ${className}`}
        data-promptly-input-size={size}
      >
        {label && (
          <label
            htmlFor={uniqueId}
            className={styles.label}
            data-promptly-input-disabled={disabled ? "true" : "false"}
          >
            {label}
          </label>
        )}

        <div
          className={styles.inputContainer}
          data-promptly-input-error={error ? "true" : "false"}
          data-promptly-input-disabled={disabled ? "true" : "false"}
        >
          {startAdornment && (
            <div className={styles.startAdornment}>{startAdornment}</div>
          )}

          <input
            id={uniqueId}
            ref={ref}
            disabled={disabled}
            className={styles.input}
            {...rest}
          />

          {endAdornment && (
            <div className={styles.endAdornment}>{endAdornment}</div>
          )}
        </div>

        {error && errorMessage && (
          <div className={styles.errorMessage}>{errorMessage}</div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
