import { init_theme, set_theme } from "$/theme";
import { logger } from "$/utils/logger";
import { mountPromptlyRoot } from "$/modules/selection/presentations/views/SelectionRoot";
import { initialize_messaging } from "$/modules/messaging/use_cases/initialize_messaging";
import { subscribe } from "$/modules/messaging/repositories/message_bus";
import { EventType } from "$/modules/messaging/models/event_types";
import type { ExtensionSettings } from "$/modules/configuration/models/user_settings";
import type { MessageEvent } from "$/modules/messaging/helpers/create_message_event";
import "./normalize.css";

export default defineContentScript({
  matches: ["*://*/*"],

  main() {
    logger.debug("Promptly content script initializing...");

    initialize_messaging();
    init_theme();

    subscribe<ExtensionSettings>(
      EventType.SETTINGS_UPDATE,
      (event: MessageEvent<ExtensionSettings>) => {
        logger.debug("Content script received theme update", event.payload);

        const new_theme_preference = event.payload.themePreference;

        let dark_mode = false;

        if (new_theme_preference === "dark") {
          dark_mode = true;
        } else if (new_theme_preference === "system") {
          dark_mode = window.matchMedia("(prefers-color-scheme: dark)").matches;
        }

        set_theme(dark_mode);
      }
    );

    return mountPromptlyRoot();
  },
});
