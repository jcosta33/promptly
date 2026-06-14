import { EventType } from "../src/modules/messaging/models/event_types";
import { publish } from "../src/modules/messaging/repositories/message_bus";
import { initialize_messaging } from "../src/modules/messaging/use_cases/initialize_messaging";
import { logger } from "../src/utils/logger";
import { get_settings } from "../src/modules/configuration/use_cases/get_settings";

export default defineBackground(() => {
  logger.log("Promptly background service starting...", {
    id: browser.runtime.id,
  });

  initialize_messaging();

  chrome.omnibox.onInputEntered.addListener(async (text) => {
    logger.log("Omnibox input received:", text);
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    const isRestrictedUrl = !tab?.url || tab.url.startsWith("chrome://") || tab.url.startsWith("edge://") || tab.url.startsWith("about:") || tab.url.startsWith("chrome-extension://");
    
    if (isRestrictedUrl) {
      const onboardingUrl = chrome.runtime.getURL("onboarding.html") + "?q=" + encodeURIComponent(text);
      chrome.tabs.create({ url: onboardingUrl });
    } else if (tab?.id) {
      publish(EventType.OMNIBOX_INPUT as any, { text }, tab.id);
    }
  });

  const fetchRemoteRegistry = async () => {
    try {
      const response = await fetch("https://raw.githubusercontent.com/mlc-ai/web-llm/main/package.json");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data && data.version) {
        await chrome.storage.local.set({ promptly_remote_engine_version: data.version });
        logger.log(`Remote model registry version updated to ${data.version}`);
      }
    } catch (e) {
      logger.log("Failed to fetch remote registry", e);
    }
  };

  let creatingOffscreen: Promise<void> | null = null;
  async function setupOffscreenDocument() {
    try {
      const existing = await chrome.offscreen.hasDocument();
      if (existing) return;
    } catch (e) { }

    if (creatingOffscreen) {
      await creatingOffscreen;
      return;
    }

    creatingOffscreen = chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['WORKERS'] as any,
      justification: 'Running WebLLM engine'
    }).catch((e) => {
      logger.warn("Failed to create offscreen document", e);
    }).finally(() => {
      creatingOffscreen = null;
    });
    await creatingOffscreen;
  }


  async function buildContextMenus() {
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({ id: "promptly-parent", title: "Promptly", contexts: ["selection"] });
      chrome.contextMenus.create({ id: "explain", parentId: "promptly-parent", title: "Ask Promptly", contexts: ["selection"] });
      chrome.contextMenus.create({ id: "summarize", parentId: "promptly-parent", title: "Summarize", contexts: ["selection"] });
      chrome.contextMenus.create({ id: "fix_grammar", parentId: "promptly-parent", title: "Fix Grammar", contexts: ["selection"] });
      
      get_settings().then((settings) => {
        if (settings.customActions && settings.customActions.length > 0) {
          settings.customActions.forEach((action) => {
            chrome.contextMenus.create({
              id: `custom_${action.id}`,
              parentId: "promptly-parent",
              title: action.name,
              contexts: ["selection"]
            });
          });
        }
      }).catch(e => logger.warn("Failed to get settings for context menus", e));
    });
  }

  chrome.storage.onChanged.addListener((_changes, areaName) => {
    if (areaName === "sync" || areaName === "local") {
      buildContextMenus();
    }
  });

  chrome.runtime.onStartup.addListener(async () => {
    await fetchRemoteRegistry();
    await setupOffscreenDocument();
    buildContextMenus();
  });

  chrome.runtime.onInstalled.addListener(async (details) => {
    await fetchRemoteRegistry();
    await setupOffscreenDocument();
    if (details.reason === "install") {
      chrome.tabs.create({ url: chrome.runtime.getURL("onboarding.html") });
    }
    
    buildContextMenus();
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "promptly-parent" || !tab?.id) return;
    
    let actionId = info.menuItemId.toString();
    if (info.menuItemId === "explain" || info.menuItemId === "summarize" || info.menuItemId === "fix_grammar") {
      actionId = info.menuItemId.toString();
    }
    
    publish(EventType.TRIGGER_CONTEXT_ACTION as any, { actionId }, tab.id);
  });

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    
    if (message.type === "PERFORM_WEB_SEARCH") {
      const query = encodeURIComponent(message.payload.query);
      fetch(`https://html.duckduckgo.com/html/?q=${query}`)
        .then(res => res.text())
        .then(html => {
          // Extremely basic regex to extract snippet text
          const snippets = [];
          const matches = html.matchAll(/<a class="result__snippet[^>]*>(.*?)<\/a>/g);
          for (const match of matches) {
            let text = match[1].replace(/<[^>]+>/g, '').trim();
            if (text) snippets.push(text);
          }
          sendResponse({ results: snippets.slice(0, 5).join('\n\n') });
        })
        .catch(err => {
          logger.warn("Web search failed", err);
          sendResponse({ results: "Web search failed or no results found." });
        });
      return true; // async response
    }
    if (message.type === "WAKE_UP_OFFSCREEN") {
      setupOffscreenDocument().then(() => sendResponse({ status: "READY" }));
      return true; 
    }
  });

  setInterval(() => {
    logger.log("Background Keep alive");
  }, 1000 * 60 * 5);
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "DOWNLOAD_MARKDOWN") {
    const dataUrl = "data:text/markdown;base64," + btoa(unescape(encodeURIComponent(message.payload.text)));
    chrome.downloads.download({
      url: dataUrl,
      filename: `promptly-chat-${new Date().toISOString().slice(0, 10)}.md`,
      saveAs: true
    });
  }
});
