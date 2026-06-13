import { type ChangeEvent, type FC, useEffect } from "react";

import { Box } from "$/components/Box/Box";
import { Flex } from "$/components/Flex/Flex";
import { Select } from "$/components/Select/Select";
import { Switch } from "$/components/Switch/Switch";
import { Text } from "$/components/Text/Text";
import { ThemePreference } from "$/modules/configuration/models/user_settings";
import { get_available_models } from "$/modules/inference/use_cases/get_available_models";
import { logger } from "$/utils/logger";

import { ModelLoadingStatus } from "../components/ModelLoadingStatus/ModelLoadingStatus";
import { ModelSelector } from "../components/ModelSelector/ModelSelector";
import { useModelLoading } from "../hooks/useModelLoading";
import { useSettings } from "../hooks/useSettings";

const themeOptions = [
  { value: ThemePreference.SYSTEM, label: "System" },
  { value: ThemePreference.LIGHT, label: "Light" },
  { value: ThemePreference.DARK, label: "Dark" },
];

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
    runtimeStatus,
    runtimeCapabilities,
    requestRuntimeCapabilities,
    unloadModel,
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

  const handleUnloadModel = () => {
    unloadModel(settings?.selectedModelId);
  };

  const handleThemeChange = async (value: string) => {
    if (Object.values(ThemePreference).includes(value as ThemePreference)) {
      try {
        await setThemePreference(value as ThemePreference);
      } catch (error) {
        logger.error("Failed to update theme preference:", error);
      }
    } else {
      logger.warn("Invalid theme value selected:", value);
    }
  };

  const loading = settingsLoading || modelLoadHookIsLoading;

  useEffect(() => {
    requestRuntimeCapabilities();
  }, [requestRuntimeCapabilities]);

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
        <Text as="h3">Extension</Text>

        <Switch
          checked={settings?.isEnabled ?? false}
          onChange={handleToggle}
          disabled={loading}
          label="Promptly enabled"
          labelPosition="right"
          size="lg"
        />

        <Text as="h3">Appearance</Text>

        <Select
          id="promptly-theme-preference"
          label="Theme"
          options={themeOptions}
          value={settings?.themePreference ?? ThemePreference.SYSTEM}
          onChange={handleThemeChange}
          disabled={settingsLoading}
          fullWidth
        />

        <Text as="h3">Model Selection</Text>

        <ModelLoadingStatus
          isLoading={modelLoadHookIsLoading}
          progress={progress}
          status={status}
          error={loadingError}
          runtimeStatus={runtimeStatus}
          runtimeCapabilities={runtimeCapabilities}
          selectedModelId={settings?.selectedModelId}
          disabled={settingsLoading}
          onLoadModel={handleLoadModel}
          onUnloadModel={handleUnloadModel}
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
