import { type FC, type ReactNode, type HTMLAttributes } from "react";
import styles from "./Flex.module.css";

export type FlexDirection = "row" | "column" | "row-reverse" | "column-reverse";
export type FlexWrap = "nowrap" | "wrap" | "wrap-reverse";
export type FlexJustify =
  | "start"
  | "end"
  | "center"
  | "between"
  | "around"
  | "evenly";
export type FlexAlign = "start" | "end" | "center" | "stretch" | "baseline";
export type FlexGap = "xxs" | "xs" | "sm" | "md" | "lg" | "xl";

export type FlexProps = {
  direction?: FlexDirection;
  wrap?: FlexWrap;
  justify?: FlexJustify;
  align?: FlexAlign;
  gap?: FlexGap;
  inline?: boolean;
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

export const Flex: FC<FlexProps> = ({
  direction = "row",
  wrap = "nowrap",
  justify = "start",
  align = "start",
  gap,
  inline = false,
  className = "",
  children,
  ...rest
}) => {
  return (
    <div
      className={`
        ${styles.flex}
        ${className}
      `}
      data-promptly-flex=""
      data-promptly-flex-direction={direction}
      data-promptly-flex-wrap={wrap}
      data-promptly-flex-justify={justify}
      data-promptly-flex-align={align}
      data-promptly-flex-gap={gap}
      data-promptly-flex-inline={inline ? "true" : "false"}
      {...rest}
    >
      {children}
    </div>
  );
};

Flex.displayName = "Flex";
