import React from "react";
import styles from "./Button.module.css";

export type ButtonSize = "sm" | "md" | "lg";
export type ButtonColor = "primary" | "secondary" | "tertiary" | "danger";

export type ButtonProps = {
  children?: React.ReactNode;
  size?: ButtonSize;
  color?: ButtonColor;
  fullWidth?: boolean;
  isLoading?: boolean;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-pressed"?: boolean;
  "aria-expanded"?: boolean;
  "aria-controls"?: string;
  "aria-haspopup"?: boolean | "menu" | "listbox" | "tree" | "grid" | "dialog";
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      size = "md",
      color = "default",
      fullWidth = false,
      isLoading = false,
      type = "button",
      disabled = false,
      className = "",
      ...rest
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={`${styles.button} ${className}`}
        data-promptly-button-size={size}
        data-promptly-button-color={color}
        data-promptly-button-fullwidth={fullWidth}
        data-promptly-button-loading={isLoading}
        disabled={disabled || isLoading}
        {...rest}
      >
        {isLoading ? (
          <div className={styles.loadingWrapper}>
            <div className={styles.loadingDot}></div>
            <div className={styles.loadingDot}></div>
            <div className={styles.loadingDot}></div>
            <span className={styles.srOnly}>Loading...</span>
          </div>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
