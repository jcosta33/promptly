import React from "react";
import styles from "./Grid.module.css";

export type GridGap = "xxs" | "xs" | "sm" | "md" | "lg" | "xl";
export type GridColumns =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | "auto-fill"
  | "auto-fit";
export type GridRows = number | "auto-fill" | "auto-fit";
export type GridAlign = "start" | "end" | "center" | "stretch";
export type GridJustify = "start" | "end" | "center" | "stretch";

export type GridProps = {
  columns?: GridColumns;
  rows?: GridRows;
  gap?: GridGap;
  rowGap?: GridGap;
  columnGap?: GridGap;
  align?: GridAlign;
  justify?: GridJustify;
  minItemWidth?: string;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

export const Grid: React.FC<GridProps> = ({
  columns = 1,
  rows,
  gap,
  rowGap,
  columnGap,
  align,
  justify,
  minItemWidth,
  inline = false,
  className = "",
  children,
  ...rest
}) => {
  return (
    <div
      className={`
        ${styles.grid}
        ${inline ? styles.inlineGrid : ""}
        ${typeof columns === "number" ? styles[`cols-${columns}`] : ""}
        ${align ? styles[`align-${align}`] : ""}
        ${justify ? styles[`justify-${justify}`] : ""}
        ${gap ? styles[`gap-${gap}`] : ""}
        ${rowGap ? styles[`row-gap-${rowGap}`] : ""}
        ${columnGap ? styles[`col-gap-${columnGap}`] : ""}
        ${className}
      `}
      style={{
        ...(minItemWidth && {
          gridTemplateColumns: `repeat(${typeof columns === "string" ? columns : "auto-fill"}, minmax(${minItemWidth}, 1fr))`,
        }),
        ...(typeof rows === "number" && {
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }),
        ...(typeof rows === "string" && {
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }),
        ...(typeof columns === "string" &&
          !minItemWidth && {
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          }),
      }}
      data-promptly-grid=""
      {...rest}
    >
      {children}
    </div>
  );
};

Grid.displayName = "Grid";
