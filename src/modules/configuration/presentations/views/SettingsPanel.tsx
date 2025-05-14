import { type ChangeEvent, type FC, useEffect } from "react";

import { Box } from "$/components/Box/Box";
import { Flex } from "$/components/Flex/Flex";
import { Switch } from "$/components/Switch/Switch";
import { Text } from "$/components/Text/Text";
import { Select } from "$/components/Select/Select";

import { ModelLoadingStatus } from "../components/ModelLoadingStatus/ModelLoadingStatus";
import { ModelSelector } from "../components/ModelSelector/ModelSelector";
import { useModelLoading } from "../hooks/useModelLoading";
import { useSettings } from "../hooks/useSettings";
import { get_available_models } from "$/modules/inference/use_cases/get_available_models";
import { logger } from "$/utils/logger";
import { ThemePreference } from "$/modules/configuration/models/user_settings";

/**
 * Main settings panel component for the popup
 */
export const SettingsPanel: FC = () => {
  const {
    settings,
    loading: settingsLoading,
    toggleEnabled,
    setSelectedModel,
    setThemePreference,
  } = useSettings();
  const modelGroups = get_available_models();

  const {
    loadModel,
    progress,
    status,
    isLoading: modelLoadHookIsLoading,
    error: loadingError,
  } = useModelLoading();

  const handleToggle = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      await handleLoadModel();
    }

    await toggleEnabled();
  };

  const handleModelSelect = async (modelId: string) => {
    await setSelectedModel(modelId);
    if (settings?.isEnabled) {
      await toggleEnabled();
    }
  };

  const handleLoadModel = async () => {
    if (!settings || !settings.selectedModelId) {
      logger.warn("No model selected, cannot trigger load.");
      return;
    }
    logger.info("Triggering model load from settings panel", {
      modelId: settings.selectedModelId,
    });
    loadModel(settings.selectedModelId);
  };

  const handleThemeChange = (value: string) => {
    if (Object.values(ThemePreference).includes(value as ThemePreference)) {
      setThemePreference(value as ThemePreference);
    } else {
      logger.warn("Invalid theme value selected:", value);
    }
  };

  const loading = settingsLoading || modelLoadHookIsLoading;

  useEffect(() => {
    logger.debug("SettingsPanel state update", {
      settingsLoading,
      isLoading: modelLoadHookIsLoading,
      progress,
      status,
      loadingError,
    });
  }, [settingsLoading, modelLoadHookIsLoading, progress, status, loadingError]);

  return (
    <Box style={{ width: "320px" }}>
      <Flex direction="column" gap="md">
        <Text as="h3">Model Selection</Text>

        <ModelLoadingStatus
          isLoading={modelLoadHookIsLoading}
          progress={progress}
          status={status}
          error={loadingError}
        />

        <Switch
          checked={settings?.isEnabled}
          onChange={handleToggle}
          disabled={loading}
          labelPosition="right"
          size="lg"
        />

        {modelGroups ? (
          <ModelSelector
            modelGroups={modelGroups}
            selectedModelId={settings?.selectedModelId}
            onModelSelect={handleModelSelect}
            disabled={loading}
          />
        ) : (
          <Text color="error">
            Error: Could not retrieve available models list.
          </Text>
        )}
      </Flex>
    </Box>
  );
};
