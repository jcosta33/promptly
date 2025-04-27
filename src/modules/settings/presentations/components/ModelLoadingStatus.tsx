import { FC } from "react";

import { Box } from "$/components/Box/Box";
import { ProgressBar } from "$/components/ProgressBar/ProgressBar";

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
        <Box p="sm" bg="transparent" style={{ color: "red" }}>
          <h4 style={{ margin: "0 0 8px 0" }}>Error Loading Model</h4>
          <p style={{ margin: 0 }}>{error}</p>
        </Box>
      )}
    </Box>
  );
};
