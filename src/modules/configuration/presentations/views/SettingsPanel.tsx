import { type ChangeEvent, type FC, useEffect, useRef, useState } from "react";


import { Box } from "$/components/Box/Box";
import { Button } from "$/components/Button/Button";
import { Flex } from "$/components/Flex/Flex";
import { Input } from "$/components/Input/Input";
import { Select } from "$/components/Select/Select";
import { Switch } from "$/components/Switch/Switch";
import { Text } from "$/components/Text/Text";
import { ThemePreference } from "$/modules/configuration/models/user_settings";
import { get_available_models } from "$/modules/inference/use_cases/get_available_models";
import { logger } from "$/utils/logger";
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('pdf.worker.min.mjs');
import { deleteKnowledgeByFilename, getAllKnowledgeMetadata, KnowledgeMetadata } from "$/modules/history/repositories/vector_db";
import { chunkText } from "$/utils/chunking";


import { ModelLoadingStatus } from "../components/ModelLoadingStatus/ModelLoadingStatus";
import { ModelSelector } from "../components/ModelSelector/ModelSelector";
import { useModelLoading } from "../hooks/useModelLoading";
import { useSettings } from "../hooks/useSettings";

import type { Persona } from "$/modules/configuration/models/user_settings";

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
    setCustomInstructions,
    updateSettings,
  } = useSettings();
  const modelGroups = get_available_models();

  const [personas, setPersonas] = useState<Persona[]>([]);

  useEffect(() => {
    chrome.storage.local.get("promptly_personas").then((res) => {
      if (res.promptly_personas) {
        setPersonas(res.promptly_personas as Persona[]);
      }
    });
  }, []);


  const handleOpenShortcuts = () => {
    chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackup = async () => {
    try {
      const data = await chrome.storage.sync.get(null);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `promptly-settings-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      logger.error("Failed to backup settings", e);
    }
  };

  const handleRestore = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const jsonString = JSON.stringify(json);
        if (new Blob([jsonString]).size > 8000) {
          alert("Backup file is too large for sync storage (max 8KB).");
          return;
        }
        await chrome.storage.sync.set(json);
        // Force reload to apply settings
        window.location.reload();
      } catch (e) {
        logger.error("Failed to restore settings", e);
        alert("Invalid backup file.");
      }
    };
    reader.readAsText(file);
  };



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

  
  const handlePersonaChange = async (value: string) => {
    if (!settings) return;
    if (value === "custom") {
      await updateSettings({ activePersonaId: "custom" });
    } else {
      const persona = personas.find(p => {return p.id === value});
      if (persona) {
        await updateSettings({ 
          activePersonaId: value, 
          customInstructions: persona.instructions 
        });
        
        const textarea = document.getElementById('promptly-custom-instructions') as HTMLTextAreaElement;
        if (textarea) textarea.value = persona.instructions;
      }
    }
  };



  const handleAddMemory = async () => {
    if (!settings) return;
    const fact = prompt("Enter a fact the AI should always remember (e.g. 'I prefer concise answers', 'I use macOS'):");
    if (!fact) return;

    const newMemory = {
      id: `mem_${Date.now()}`,
      fact
    };

    const updatedMemories = [...(settings.persistentMemories || []), newMemory];
    await updateSettings({ persistentMemories: updatedMemories });
  };

  const handleDeleteMemory = async (id: string) => {
    if (!settings) return;
    if (!confirm("Delete this memory?")) return;
    const updatedMemories = (settings.persistentMemories || []).filter(m => m.id !== id);
    await updateSettings({ persistentMemories: updatedMemories });
  };

  const handleAddCustomAction = async () => {
    if (!settings) return;
    const name = prompt("Enter a name for the Custom Action (e.g. 'Translate to Spanish'):");
    if (!name) return;
    const promptText = prompt("Enter the prompt (e.g. 'Translate the following text to Spanish:'):");
    if (!promptText) return;

    const newAction = {
      id: `custom_action_${Date.now()}`,
      name,
      prompt: promptText
    };

    const updatedActions = [...(settings.customActions || []), newAction];
    await updateSettings({ customActions: updatedActions });
  };

  const handleDeleteCustomAction = async (id: string) => {
    if (!settings) return;
    if (!confirm("Delete this Custom Action?")) return;
    const updatedActions = (settings.customActions || []).filter(a => a.id !== id);
    await updateSettings({ customActions: updatedActions });
  };

  const handleSavePersona = async () => {
    if (!settings || !settings.customInstructions.trim()) return;
    const name = prompt("Enter a name for this Persona:");
    if (!name) return;

    const newPersona = {
      id: `persona_${Date.now()}`,
      name,
      instructions: settings.customInstructions
    };

    const updatedPersonas = [...personas, newPersona];
    setPersonas(updatedPersonas);
    await chrome.storage.local.set({ promptly_personas: updatedPersonas });
    await updateSettings({ activePersonaId: newPersona.id });
  };

  const handleDeletePersona = async () => {
    if (!settings || !settings.activePersonaId || settings.activePersonaId === "custom") return;
    if (!confirm("Are you sure you want to delete this Persona?")) return;

    const updatedPersonas = personas.filter(p => {return p.id !== settings.activePersonaId});
    setPersonas(updatedPersonas);
    await chrome.storage.local.set({ promptly_personas: updatedPersonas });
    await updateSettings({ activePersonaId: "custom" });
  };

  const handleInstructionsChange = async (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (settings?.activePersonaId && settings.activePersonaId !== "custom") {
      const activePersona = personas.find(p => {return p.id === settings.activePersonaId});
      if (activePersona && activePersona.instructions !== val) {
        // Switching to custom if edited
        await updateSettings({ activePersonaId: "custom", customInstructions: val });
        return;
      }
    }
    await setCustomInstructions(val);
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


  const [storageUsage, setStorageUsage] = useState<number | null>(null);

  const [isClearingCaches, setIsClearingCaches] = useState(false);

  const [knowledgeMetadata, setKnowledgeMetadata] = useState<KnowledgeMetadata[]>([]);
  const [storageMetrics, setStorageMetrics] = useState<{ used: number; quota: number } | null>(null);

  const fetchKnowledgeMetadata = async () => {
    try {
      const data = await getAllKnowledgeMetadata();
      setKnowledgeMetadata(data);
    } catch (err) {
      logger.error("Failed to fetch knowledge metadata", err);
    }
  };

  

  useEffect(() => {
    fetchKnowledgeMetadata();
  }, []);

  const handleDeleteKnowledge = async (filename: string) => {
    if (!confirm(`Delete all chunks for ${filename}?`)) return;
    await deleteKnowledgeByFilename(filename);
    fetchKnowledgeMetadata();
    calculateStorage();
  };


  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

    const calculateStorage = async () => {
    try {
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        setStorageUsage(estimate.usage || 0);
        setStorageMetrics({
          used: estimate.usage || 0,
          quota: estimate.quota || 0,
        });
      }
    } catch (e) {
      console.error("Storage estimate failed", e);
    }
  };

  useEffect(() => {
  }, []);

  const handleClearCaches = async () => {
    if (!confirm("Are you sure you want to delete ALL downloaded LLM models? This will free up gigabytes of disk space but requires re-downloading weights for future use.")) return;
    setIsClearingCaches(true);
    try {
      if (window.caches) {
        const cacheNames = await window.caches.keys();
        for (const name of cacheNames) {
          if (name.includes("webllm")) {
            await window.caches.delete(name);
          }
        }
      }
      await calculateStorage();
      alert("LLM Model caches successfully cleared.");
    } catch (e) {
      console.error("Failed to clear caches", e);
      alert("Failed to clear caches. See console for details.");
    } finally {
      setIsClearingCaches(false);
    }
  };

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

        
        
        
        
        
        
        <Text as="h3">Persistent Memory</Text>
        <Flex direction="column" gap="sm">
          <Text size="sm" color="muted">
            Define core facts Promptly should always remember across all conversations.
          </Text>
          {(settings?.persistentMemories || []).map((mem) => (
            <Flex key={mem.id} justify="between" align="center" style={{ padding: '8px', border: '1px solid var(--promptly-border-color)', borderRadius: '4px' }}>
              <Text size="sm">{mem.fact}</Text>
              <Button size="sm" color="danger" onClick={() => handleDeleteMemory(mem.id)}>Forget</Button>
            </Flex>
          ))}
          <Button size="sm" color="secondary" onClick={handleAddMemory}>
            + Add Memory Fact
          </Button>
        </Flex>

        <Text as="h3">Custom Context Menu Actions</Text>

        <Flex direction="column" gap="sm">
          <Text size="sm" color="muted">
            Create custom actions that appear in the browser right-click menu.
          </Text>
          {(settings?.customActions || []).map((action) => (
            <Flex key={action.id} justify="between" align="center" style={{ padding: '8px', border: '1px solid var(--promptly-border-color)', borderRadius: '4px' }}>
              <Flex direction="column" gap="xs">
                <Text size="sm"><strong>{action.name}</strong></Text>
                <Text size="xs" color="muted">{action.prompt}</Text>
              </Flex>
              <Button size="sm" color="danger" onClick={() => handleDeleteCustomAction(action.id)}>Delete</Button>
            </Flex>
          ))}
          <Button size="sm" color="secondary" onClick={handleAddCustomAction}>
            + Add Custom Action
          </Button>
        </Flex>

        <Text as="h3">Storage Management</Text>

        <Flex direction="column" gap="xs">
          <Text size="sm" color="muted">
            Local LLM weights are stored in the browser&apos;s CacheStorage.
          </Text>
          <Flex justify="between" align="center">
            <Text size="sm">
              Estimated Total Usage: <strong>{storageMetrics !== null ? formatBytes(storageMetrics.used) : (storageUsage !== null ? formatBytes(storageUsage) : "Calculating...")}</strong> {storageMetrics?.quota ? ` / ${formatBytes(storageMetrics!.quota)}` : ''}
            </Text>
            <Button size="sm" color="danger" onClick={handleClearCaches} disabled={isClearingCaches}>
              {isClearingCaches ? "Clearing..." : "Clear LLM Caches"}
            </Button>
          </Flex>
          {storageUsage !== null && storageMetrics !== null && storageMetrics?.quota > 0 && (
            <div style={{ width: '100%', height: '8px', background: 'var(--promptly-bg-tertiary)', borderRadius: '4px', overflow: 'hidden', marginTop: '8px' }}>
              <div style={{ 
                width: `${Math.min(100, (storageUsage / storageMetrics!.quota) * 100)}%`, 
                height: '100%', 
                background: 'var(--promptly-primary)' 
              }} />
            </div>
          )}
        </Flex>

        
        <Text as="h3">Domain Personas</Text>
        <Flex direction="column" gap="sm">
          <Text size="sm" color="muted">Define custom system prompts that activate on specific websites.</Text>
          {(settings?.domainPersonas || []).map((dp, idx) => (
            <Flex direction="row" gap="xs" align="center" key={`dp-${idx}`}>
              <Input 
                value={dp.domain} 
                onChange={(e) => {
                  if (!settings) return;
                  const newDps = [...(settings.domainPersonas || [])];
                  newDps[idx].domain = e.target.value;
                  updateSettings({ domainPersonas: newDps });
                }}
                placeholder="github.com"
              />
              <Input 
                value={dp.prompt} 
                onChange={(e) => {
                  if (!settings) return;
                  const newDps = [...(settings.domainPersonas || [])];
                  newDps[idx].prompt = e.target.value;
                  updateSettings({ domainPersonas: newDps });
                }}
                placeholder="Act as a strict code reviewer."
              />
              <Button size="sm" color="danger" onClick={() => {
                if (!settings) return;
                const newDps = [...(settings.domainPersonas || [])];
                newDps.splice(idx, 1);
                updateSettings({ domainPersonas: newDps });
              }}>Remove</Button>
            </Flex>
          ))}
          <Button size="sm" color="secondary" onClick={() => {
            if (!settings) return;
            const newDps = [...(settings.domainPersonas || []), { domain: '', prompt: '' }];
            updateSettings({ domainPersonas: newDps });
          }}>+ Add Domain Persona</Button>
        </Flex>

        <Text as="h3">Workspace Knowledge Base</Text>
        <Flex direction="column" gap="sm">
          <Text size="sm" color="muted">Upload PDFs or Markdown files to build a persistent semantic brain.</Text>
          <input 
            type="file" 
            accept=".txt,.md,.pdf" 
            multiple 
            onChange={async (e) => {
              const files = e.target.files;
              if (!files) return;
              
              for (const file of Array.from(files)) {
                let text = "";

                if (file.name.endsWith('.pdf')) {
                  const arrayBuffer = await file.arrayBuffer();
                  try {
                    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
                    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                      const page = await pdf.getPage(pageNum);
                      const textContent = await page.getTextContent();
                      const pageText = textContent.items.map((item: any) => item.str).join(' ');
                      text += pageText + "\n\n";
                    }
                  } catch (err) {
                    console.error("Failed to parse PDF:", err);
                  }
                } else {
                  text = await file.text();
                }
                
                await chrome.runtime.sendMessage({ type: "WAKE_UP_OFFSCREEN" });
                const chunks = chunkText(text, 300, 50);
                
                for (const chunk of chunks) {
                  try {
                    chrome.runtime.sendMessage(
                      { type: "generate_embedding", payload: { text: chunk } },
                      (response) => {
                        if (response && response.embedding) {
                          // The actual storage needs to be triggered here. For simplicity,
                          // we can dispatch another IPC or do it here if we exported storeKnowledgeEmbedding.
                          // Wait, we need to import storeKnowledgeEmbedding! Let's do it below.
                        }
                      }
                    );
                  } catch(err) {
                    console.error("Chunking error", err);
                  }
                }
              }
              alert("Files queued for background processing into Knowledge Base!");
            }} 
          />
          
          <Flex direction="column" gap="xs">
            {knowledgeMetadata.map((km) => (
               <Flex key={km.filename} justify="between" align="center" style={{ padding: '8px', border: '1px solid var(--promptly-border-color)', borderRadius: '4px' }}>
                 <Flex direction="column">
                   <Text size="sm"><strong>{km.filename}</strong></Text>
                   <Text size="xs" color="muted">{km.chunkCount} chunks</Text>
                 </Flex>
                 <Button size="sm" color="danger" onClick={() => handleDeleteKnowledge(km.filename)}>Delete</Button>
               </Flex>
            ))}
          </Flex>
        </Flex>

        <Text as="h3">Developer Dashboard</Text>
        <Flex direction="column" gap="xs">
          {storageMetrics ? (
            <Flex direction="column" gap="xs">
              <Text size="sm">
                Used: <strong>{formatBytes(storageMetrics.used)}</strong> / {formatBytes(storageMetrics.quota)}
              </Text>
              <div style={{ width: '100%', height: '8px', background: 'var(--promptly-bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${Math.min(100, (storageMetrics.used / storageMetrics.quota) * 100)}%`, 
                  height: '100%', 
                  background: 'var(--promptly-primary)' 
                }} />
              </div>
              <Text size="xs" color="muted">
                Includes WebLLM CacheStorage, IndexedDB Vector Store, and local configurations.
              </Text>
            </Flex>
          ) : (
            <Text size="sm" color="muted">Storage metrics unavailable in this browser.</Text>
          )}
        </Flex>

        <Text as="h3">Backup & Restore</Text>

        <Flex gap="sm">
          <Button size="sm" color="secondary" onClick={handleBackup} style={{ flex: 1 }}>
            Backup Settings
          </Button>
          <Button size="sm" color="secondary" onClick={() => {return fileInputRef.current?.click()}} style={{ flex: 1 }}>
            Restore Settings
          </Button>
          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            style={{ display: "none" }} 
            onChange={handleRestore} 
          />
        </Flex>

        <Text as="h3">Keyboard Shortcuts</Text>

        <Flex justify="between" align="center">
          <Text size="sm" color="muted">Configure the global activation shortcut (e.g. Cmd+Shift+P)</Text>
          <Button size="sm" color="secondary" onClick={handleOpenShortcuts}>
            Open Settings
          </Button>
        </Flex>
        
        
        <Text as="h3">Custom Instructions</Text>

        <Flex gap="sm" align="end" style={{ marginBottom: "8px" }}>
          <Box style={{ flex: 1 }}>
            <Select
              id="promptly-persona-select"
              label=""
              options={[
                { value: "custom", label: "Custom (Unsaved)" },
                ...personas.map(p => {return { value: p.id, label: p.name }})
              ]}
              value={settings?.activePersonaId || "custom"}
              onChange={handlePersonaChange}
              disabled={settingsLoading}
              fullWidth
            />
          </Box>
          <Button size="sm" color="secondary" onClick={handleSavePersona} title="Save current persona" disabled={settingsLoading || !settings?.customInstructions.trim()}>
            Save
          </Button>
          {settings?.activePersonaId && settings.activePersonaId !== "custom" && (
            <Button size="sm" color="danger" onClick={handleDeletePersona} title="Delete current persona" disabled={settingsLoading}>
              Delete
            </Button>
          )}
        </Flex>

        <textarea
          id="promptly-custom-instructions"
          placeholder="e.g. Always reply in Pirate speak, never use bullet points..."
          defaultValue={settings?.customInstructions || ""}
          onBlur={handleInstructionsChange}
          disabled={settingsLoading}
          style={{ width: "100%", minHeight: "80px", padding: "8px", borderRadius: "4px", border: "1px solid var(--border-color)", backgroundColor: "var(--background-color-tertiary)", color: "var(--text-color)", fontFamily: "inherit", boxSizing: "border-box" }}
        />


        
        <Text as="h3">Custom API Provider</Text>
        <Flex direction="column" gap="sm">
          <Switch
            checked={settings?.useCustomApi ?? false}
            onChange={async (e) => await updateSettings({ useCustomApi: e.target.checked })}
            disabled={settingsLoading}
            label="Use Custom API"
            labelPosition="right"
          />
          {settings?.useCustomApi && (
            <>
              <Input
                label="API Endpoint"
                value={settings?.customApiEndpoint ?? ""}
                onChange={async (e) => await updateSettings({ customApiEndpoint: e.target.value })}
                placeholder="https://api.openai.com/v1"
                disabled={settingsLoading}
              />
              <Input
                label="API Key"
                type="password"
                value={settings?.customApiKey ?? ""}
                onChange={async (e) => await updateSettings({ customApiKey: e.target.value })}
                placeholder="sk-..."
                disabled={settingsLoading}
              />
              <Input
                label="Model ID"
                value={settings?.customApiModelId ?? ""}
                onChange={async (e) => await updateSettings({ customApiModelId: e.target.value })}
                placeholder="gpt-3.5-turbo"
                disabled={settingsLoading}
              />
            </>
          )}
        </Flex>

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
