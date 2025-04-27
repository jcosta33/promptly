import { FC } from "react";

import { Box } from "$/components/Box/Box";

import styles from "./SelectionPreview.module.css";

export type SelectionPreviewProps = {
  selection: {
    text: string;
    type: string;
  };
};

/**
 * Component to preview the selected text and its type
 */
export const SelectionPreview: FC<SelectionPreviewProps> = ({ selection }) => {
  // Function to truncate text if too long
  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <Box className={styles.previewContainer}>
      <div className={styles.previewText}>{truncateText(selection.text)}</div>
      <div className={styles.previewType}>{selection.type}</div>
    </Box>
  );
};
