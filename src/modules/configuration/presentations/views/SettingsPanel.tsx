import { type ChangeEvent, type FC, useEffect } from "react";

import { Box } from "$/components/Box/Box";
import { Flex } from "$/components/Flex/Flex";
import { Switch } from "$/components/Switch/Switch";
import { Text } from "$/components/Text/Text";
import { AVAILABLE_MODELS } from "$/modules/inference/repositories/get_available_models";

import { ModelLoadingStatus } from "../components/ModelLoadingStatus/ModelLoadingStatus";
import { ModelSelector } from "../components/ModelSelector";
import { useModelLoading } from "../hooks/useModelLoading";
import { useSettings } from "../hooks/useSettings";
import { logger } from "$/utils/logger";

/**
 * Main settings panel component for the popup
 */
export const SettingsPanel: FC = () => {
  const { settings, loading, toggleEnabled, setSelectedModel } = useSettings();

  const {
    loadModel,
    progress,
    status,
    isLoading,
    error: loadingError,
  } = useModelLoading();

  // Handle toggle enabled
  const handleToggle = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      await handleLoadModel();
    }

    await toggleEnabled();
  };

  // Handle model selection
  const handleModelSelect = async (modelId: string) => {
    await setSelectedModel(modelId);
    if (settings?.isEnabled) {
      await toggleEnabled();
    }
  };

  // Handle model load button
  const handleLoadModel = async () => {
    if (!settings || !settings.selectedModelId) {
      logger.warn("No model selected, cannot trigger load.");
      return;
    }
    logger.info("Triggering model load from settings panel", { modelId: settings.selectedModelId });
    loadModel(settings.selectedModelId);
  };

  // Log loading state changes for debugging
  useEffect(() => {
    logger.debug("SettingsPanel state update", { isLoading, progress, status, loadingError });
  }, [isLoading, progress, status, loadingError]);

  return (
    <Box>
      <Flex direction="column" gap="md">
        {/* Model Selection */}
        <Text as="h3">Model Selection</Text>
        {/* Loading Status */}
        <ModelLoadingStatus
          isLoading={isLoading}
          progress={progress}
          status={status}
          error={loadingError}
        />
        {/* Enable/Disable Switch */}
        <Switch
          checked={settings?.isEnabled}
          onChange={handleToggle}
          disabled={loading}
          labelPosition="right"
          size="lg"
        />

        <ModelSelector
          modelGroups={AVAILABLE_MODELS}
          selectedModelId={settings?.selectedModelId}
          onModelSelect={handleModelSelect}
          disabled={loading}
        />
      </Flex>
    </Box>
  );
};
