import { type FC } from "react";

import { Box } from "$/components/Box/Box";
import { Button } from "$/components/Button/Button";
import { Flex } from "$/components/Flex/Flex";
import { ProgressBar } from "$/components/ProgressBar/ProgressBar";
import { Text } from "$/components/Text/Text";
import type { ModelRuntimeStatus } from "$/modules/messaging/models/event_types";
import styles from "./ModelLoadingStatus.module.css";

interface ModelLoadingStatusProps {
  isLoading: boolean;
  progress: number;
  status: string;
  error: string | null;
  runtimeStatus: ModelRuntimeStatus;
  selectedModelId?: string;
  disabled?: boolean;
  onLoadModel: () => void;
  onUnloadModel: () => void;
}

/**
 * Component to display model loading progress
 */
export const ModelLoadingStatus: FC<ModelLoadingStatusProps> = ({
  isLoading,
  progress,
  status,
  error,
  runtimeStatus,
  selectedModelId,
  disabled = false,
  onLoadModel,
  onUnloadModel,
}) => {
  const statusText =
    runtimeStatus.phase === "loaded"
      ? `Loaded: ${runtimeStatus.modelId || selectedModelId || "selected model"}`
      : runtimeStatus.phase === "loading"
        ? runtimeStatus.message || "Loading model..."
        : runtimeStatus.phase === "unavailable"
          ? runtimeStatus.message || "WebGPU is unavailable"
          : runtimeStatus.phase === "error"
            ? runtimeStatus.error || runtimeStatus.message || "Model error"
            : "No model loaded";

  const canLoad =
    Boolean(selectedModelId) &&
    !isLoading &&
    runtimeStatus.phase !== "unavailable";
  const canUnload = runtimeStatus.phase === "loaded" && !isLoading;

  return (
    <Box bg="secondary" p="sm">
      <Flex direction="column" gap="sm">
        <Flex direction="column" gap="xs">
          <Text as="h4" size="sm" weight="bold">
            Model runtime
          </Text>
          <Text
            size="xs"
            color={runtimeStatus.phase === "error" ? "error" : "muted"}
          >
            {statusText}
          </Text>
        </Flex>

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

        <Flex gap="xs" wrap="wrap">
          <Button
            size="sm"
            color="primary"
            onClick={onLoadModel}
            disabled={!canLoad || disabled}
          >
            {runtimeStatus.phase === "loaded" ? "Reload" : "Load"}
          </Button>
          <Button
            size="sm"
            color="tertiary"
            onClick={onUnloadModel}
            disabled={!canUnload || disabled}
          >
            Unload
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};
