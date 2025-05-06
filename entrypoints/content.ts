import { initTheme, setTheme } from "$/theme";
import { logger } from "$/utils/logger";
import { mountPromptlyRoot } from "$/modules/selection/presentations/views/SelectionRoot";
import { initialize_messaging } from "$/modules/messaging/use_cases/initialize_messaging";
import { subscribe } from "$/modules/messaging/repositories/message_bus";
import { EventType } from "$/modules/messaging/models/event_types";
import type { ExtensionSettings } from "$/modules/configuration/models/user_settings";
import type { MessageEvent } from "$/modules/messaging/helpers/create_message_event";

import "../public/css/normalize.css";

export default defineContentScript({
  matches: ["*://*/*"],

  main() {
    logger.debug("Promptly content script initializing...");

    initialize_messaging();
    initTheme();

    subscribe<ExtensionSettings>(
      EventType.SETTINGS_UPDATE,
      (event: MessageEvent<ExtensionSettings>) => {
        logger.debug("Content script received theme update", event.payload);
        const newThemePref = event.payload.themePreference;
        let darkMode = false;
        if (newThemePref === "dark") {
          darkMode = true;
        } else if (newThemePref === "system") {
          darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
        }
        setTheme(darkMode);
      }
    );

    return mountPromptlyRoot();
  },
});
