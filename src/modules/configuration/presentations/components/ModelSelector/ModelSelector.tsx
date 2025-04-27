import { type FC, useEffect, useState } from "react";

import { Box } from "$/components/Box/Box";
import { Flex } from "$/components/Flex/Flex";
import { Select } from "$/components/Select/Select";
import { Text } from "$/components/Text/Text";
import type {
  ModelGroupName,
  ModelGroups,
  ModelRecord
} from "$/modules/inference/models/inference_model";
import styles from "./ModelSelector.module.css";

type ModelSelectorProps = {
  modelGroups: ModelGroups;
  selectedModelId: string | undefined;
  onModelSelect: (modelId: string) => void;
  disabled?: boolean;
};

/**
 * Component for selecting a model from the available model groups
 */
export const ModelSelector: FC<ModelSelectorProps> = ({
  modelGroups,
  selectedModelId,
  onModelSelect,
  disabled = false,
}) => {
  const [modelFamilies, setModelFamilies] = useState<string[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<ModelGroupName | undefined>(undefined);
  const [selectedModel, setSelectedModel] = useState<ModelRecord | undefined>(undefined);

  // Extract model families on component mount
  useEffect(() => {
    if (!modelGroups || Object.keys(modelGroups).length === 0) return;

    const families = Object.keys(modelGroups) as ModelGroupName[];
    setModelFamilies(families);

    // Set initial family selection
    if (selectedModelId) {
      // Find which family contains the selected model
      for (const family of families) {
        const foundModel = modelGroups[family].find((model) => {
          return model.name === selectedModelId;
        });
        if (foundModel) {
          setSelectedFamily(family);
          setSelectedModel(foundModel);
          break;
        }
      }
    }
  }, [modelGroups, selectedModelId]);

  // Auto-select first model when family changes and no model is selected
  useEffect(() => {
    if (!selectedFamily || !modelGroups) {
      return

    };

    const familyModels = modelGroups[selectedFamily] || [];

    if (selectedModelId) {
      const model = familyModels.find((m) => {
        return m.name === selectedModelId;
      });

      if (model) {
        setSelectedModel(model);
      } else if (familyModels.length > 0) {
        // If selected model is not in this family, select the first model
        onModelSelect(familyModels[0].name);
        setSelectedModel(familyModels[0]);
      }
    } else if (familyModels.length > 0) {
      // If no model is selected, select the first one
      onModelSelect(familyModels[0].name);
      setSelectedModel(familyModels[0]);
    }
  }, [selectedFamily, modelGroups, selectedModelId, onModelSelect]);

  const handleFamilyChange = (value: string) => {
    setSelectedFamily(value as ModelGroupName);
  };

  const handleModelChange = (value: string) => {
    if (!selectedFamily) {
      return;
    }

    const model = modelGroups[selectedFamily]?.find((m) => {
      return m.name === value;
    });
    if (model) {
      setSelectedModel(model);
      onModelSelect(value);
    }
  };

  return (
    <>
      <Select
        options={modelFamilies.map((family) => {
          return {
            value: family,
            label: family,
          };
        })}
        value={selectedFamily}
        onChange={handleFamilyChange}
        label="Model Family"
        placeholder="Select model family"
        disabled={disabled || modelFamilies.length === 0}
        fullWidth
      />

      {selectedFamily ? <Select
        options={(modelGroups[selectedFamily] || []).map((model) => {
          return {
            value: model.name,
            label: model.display_name,
          };
        })}
        value={selectedModelId}
        onChange={handleModelChange}
        label="Model"
        placeholder="Select model"
        disabled={
          disabled ||
          !selectedFamily ||
          modelGroups[selectedFamily]?.length === 0
        }
        fullWidth
      /> : null}

      {selectedModel && (
        <>
          <Text as="h4" weight="medium" color="primary">
            {selectedModel.display_name}
          </Text>

          <Text as="p" weight="medium" color="muted">
            Memory: {selectedModel.memory_requirements}
          </Text>

          <Text as="p" size="sm">
            {selectedModel.short_description}
          </Text>

          {selectedModel.tags && selectedModel.tags.length > 0 && (
            <Flex gap="xs" wrap="wrap">
              {selectedModel.tags.map((tag, index) => {
                return (
                  <Box
                    key={index}
                    p="xs"
                    bg="secondary"
                    className={styles.tagBox}
                  >
                    <Text size="sm">{tag}</Text>
                  </Box>
                );
              })}
            </Flex>
          )}
        </>
      )}
    </>
  );
};
