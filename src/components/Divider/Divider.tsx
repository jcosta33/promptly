import React from "react";
import styles from "./Divider.module.css";

export type DividerVariant =
  | "solid"
  | "dashed"
  | "dotted"
  | "groove"
  | "ridge"
  | "double";
export type DividerOrientation = "horizontal" | "vertical";
export type DividerThickness = "thin" | "medium" | "thick";

export type DividerProps = {
  variant?: DividerVariant;
  orientation?: DividerOrientation;
  thickness?: DividerThickness;
  className?: string;
  label?: string;
  color?: "primary" | "secondary" | "tertiary" | "default";
} & React.HTMLAttributes<HTMLDivElement>;

export const Divider: React.FC<DividerProps> = ({
  variant = "solid",
  orientation = "horizontal",
  thickness = "medium",
  className = "",
  label,
  color = "default",
  ...rest
}) => {
  return (
    <div
      className={`
        ${styles.divider}
        ${styles[variant]}
        ${styles[orientation]}
        ${styles[`thickness-${thickness}`]}
        ${styles[`color-${color}`]}
        ${className}
      `}
      data-promptly-divider-orientation={orientation}
      data-promptly-divider-variant={variant}
      role="separator"
      aria-orientation={orientation}
      {...rest}
    >
      {label && (
        <div className={styles.label}>
          <span>{label}</span>
        </div>
      )}
    </div>
  );
};

Divider.displayName = "Divider";
