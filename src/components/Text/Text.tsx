import React from "react";
import styles from "./Text.module.css";

export type TextSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type TextWeight = "normal" | "medium" | "bold";
export type TextColor =
  | "default"
  | "primary"
  | "secondary"
  | "muted"
  | "error"
  | "success";
export type TextAlign = "left" | "center" | "right";

export type TextBaseProps = {
  as?: React.ElementType;
  size?: TextSize;
  weight?: TextWeight;
  color?: TextColor;
  align?: TextAlign;
  truncate?: boolean;
  className?: string;
};

export type TextProps = TextBaseProps &
  Omit<React.HTMLAttributes<HTMLElement>, keyof TextBaseProps>;

export const Text: React.FC<TextProps> = ({
  as: Component = "p",
  size = "md",
  weight = "normal",
  color = "default",
  align = "left",
  truncate = false,
  className = "",
  children,
  ...rest
}) => {
  return (
    <Component
      className={`${styles.text} ${className}`}
      data-promptly-text-size={size}
      data-promptly-text-weight={weight}
      data-promptly-text-color={color}
      data-promptly-text-align={align}
      data-promptly-text-truncate={truncate ? "true" : "false"}
      {...rest}
    >
      {children}
    </Component>
  );
};

Text.displayName = "Text";
