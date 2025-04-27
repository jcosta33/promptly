import { type FC } from "react";

import { Box } from "$/components/Box/Box";
import { ProgressBar } from "$/components/ProgressBar/ProgressBar";
import styles from "./ModelLoadingStatus.module.css";

interface ModelLoadingStatusProps {
  isLoading: boolean;
  progress: number;
  status: string;
  error: string | null;
}

/**
 * Component to display model loading progress
 */
export const ModelLoadingStatus: FC<ModelLoadingStatusProps> = ({
  isLoading,
  progress,
  status,
  error,
}) => {
  if (!isLoading && !error) {
    return null;
  }

  return (
    <Box>
      {isLoading && (
        <ProgressBar
          value={progress}
          label="Loading Model"
          helperText={status || "Preparing model..."}
          variant="primary"
          size="md"
        />
      )}

      {error && !isLoading && (
        <Box p="sm" bg="transparent" className={styles.errorContainer}>
          <h4 className={styles.errorTitle}>Error Loading Model</h4>
          <p className={styles.errorMessage}>{error}</p>
        </Box>
      )}
    </Box>
  );
};
