import React from "react";
import { Box } from "../Box/Box";
import styles from "./Card.module.css";

export type CardProps = {
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  isLoading?: boolean;
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className = "",
      header,
      footer,
      isLoading = false,
      children,
      ...rest
    },
    ref
  ) => {
    return (
      <div ref={ref} className={styles.cardWrapper}>
        <Box
          className={`${styles.card} ${className}`}
          role="region"
          {...rest}
        >
          {isLoading && (
            <div className={styles.loadingOverlay}>
              <div className={styles.loadingSpinner}>
                <div className={styles.loadingCircle}></div>
                <div className={styles.loadingCircle}></div>
                <div className={styles.loadingCircle}></div>
              </div>
            </div>
          )}
          
          {header && (
            <div className={styles.cardHeader}>
              {header}
            </div>
          )}
          
          <div className={styles.cardBody}>
            {children}
          </div>
          
          {footer && (
            <div className={styles.cardFooter}>
              {footer}
            </div>
          )}
        </Box>
      </div>
    );
  }
);

Card.displayName = "Card";
