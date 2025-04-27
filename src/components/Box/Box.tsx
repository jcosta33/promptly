import React from "react";
import styles from "./Box.module.css";

type BoxPadding = "xxs" | "xs" | "sm" | "md" | "lg" | "xl";
type BoxMargin = "xxs" | "xs" | "sm" | "md" | "lg" | "xl";
type BoxElevation = "1" | "2";
type BoxBgColor =
  | "primary"
  | "secondary"
  | "tertiary"
  | "transparent"
  | "light";
type BoxRadius = "sm" | "md" | "lg" | "full";

export type BoxBaseProps = {
  as?: React.ElementType;
  p?: BoxPadding;
  m?: BoxMargin;
  elevation?: BoxElevation;
  bg?: BoxBgColor;
  radius?: BoxRadius;
  inset?: boolean;
  outset?: boolean;
  interactive?: boolean;
  className?: string;
};

export type BoxProps = BoxBaseProps &
  Omit<React.HTMLAttributes<HTMLElement>, keyof BoxBaseProps>;

export const Box: React.FC<BoxProps> = ({
  as: Component = "div",
  p = "md",
  m,
  elevation,
  bg,
  radius = "md",
  inset = false,
  outset = false,
  interactive = false,
  className = "",
  children,
  ...rest
}) => {
  return (
    <Component
      className={`${styles.box} ${className}`}
      data-promptly-box-p={p}
      data-promptly-box-m={m}
      data-promptly-box-elevation={elevation}
      data-promptly-box-bg={bg}
      data-promptly-box-radius={radius}
      data-promptly-box-inset={inset ? "true" : "false"}
      data-promptly-box-outset={outset ? "true" : "false"}
      data-promptly-box-interactive={interactive ? "true" : "false"}
      {...rest}
    >
      {children}
    </Component>
  );
};

Box.displayName = "Box";
