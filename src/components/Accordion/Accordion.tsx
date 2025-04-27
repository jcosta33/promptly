import React, { useState } from "react";
import styles from "./Accordion.module.css";

export type AccordionItem = {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
};

export type AccordionProps = {
  items: AccordionItem[];
  defaultExpandedId?: string;
  allowMultiple?: boolean;
  iconPosition?: "left" | "right";
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export const Accordion: React.FC<AccordionProps> = ({
  items,
  defaultExpandedId,
  allowMultiple = false,
  iconPosition = "right",
  className = "",
  ...rest
}) => {
  const [expandedIds, setExpandedIds] = useState<string[]>(
    defaultExpandedId ? [defaultExpandedId] : []
  );

  const handleToggle = (id: string) => {
    if (expandedIds.includes(id)) {
      setExpandedIds(expandedIds.filter((itemId) => itemId !== id));
    } else {
      if (allowMultiple) {
        setExpandedIds([...expandedIds, id]);
      } else {
        setExpandedIds([id]);
      }
    }
  };

  return (
    <div
      className={`${styles.accordion} ${className}`}
      role="presentation"
      {...rest}
    >
      {items.map((item) => {
        const isExpanded = expandedIds.includes(item.id);

        return (
          <div
            key={item.id}
            className={styles.accordionItem}
            data-promptly-accordion-expanded={isExpanded ? "true" : "false"}
            data-promptly-accordion-disabled={item.disabled ? "true" : "false"}
          >
            <button
              className={`
                ${styles.accordionHeader}
                ${iconPosition === "left" ? styles.iconLeft : styles.iconRight}
              `}
              onClick={() => !item.disabled && handleToggle(item.id)}
              aria-expanded={isExpanded}
              aria-controls={`accordion-content-${item.id}`}
              disabled={item.disabled}
              type="button"
            >
              <div className={styles.accordionTitle}>{item.title}</div>
              <div className={styles.accordionIcon}></div>
            </button>

            <div
              id={`accordion-content-${item.id}`}
              className={styles.accordionContent}
              aria-hidden={!isExpanded}
              role="region"
              style={{
                maxHeight: isExpanded ? "1000px" : "0",
              }}
            >
              <div className={styles.accordionContentInner}>{item.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

Accordion.displayName = "Accordion";
