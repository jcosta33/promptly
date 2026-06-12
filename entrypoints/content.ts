import { apply_theme_preference, init_theme } from "$/theme";
import { logger } from "$/utils/logger";
import { mountPromptlyRoot } from "$/modules/selection/presentations/views/SelectionRoot";
import { initialize_messaging } from "$/modules/messaging/use_cases/initialize_messaging";
import { subscribe } from "$/modules/messaging/repositories/message_bus";
import { EventType } from "$/modules/messaging/models/event_types";
import type { ExtensionSettings } from "$/modules/configuration/models/user_settings";
import type { MessageEvent } from "$/modules/messaging/helpers/create_message_event";
import { get_settings } from "$/modules/configuration/use_cases/get_settings";
import "./normalize.css";

export default defineContentScript({
  matches: ["*://*/*"],

  main() {
    logger.debug("Promptly content script initializing...");

    const styleEl = document.createElement("style");
    document.head.appendChild(styleEl);
    const styleSheet = styleEl.sheet;

    const fontFaces = [
      {
        fontFamily: "JetBrains Mono",
        fontStyle: "normal",
        fontWeight: "100 800",
        fontDisplay: "swap",
        srcPath: "fonts/JetBrains_Mono/JetBrainsMono-VariableFont_wght.ttf",
        format: "truetype-variations",
      },
      {
        fontFamily: "JetBrains Mono",
        fontStyle: "italic",
        fontWeight: "100 800",
        fontDisplay: "swap",
        srcPath:
          "fonts/JetBrains_Mono/JetBrainsMono-Italic-VariableFont_wght.ttf",
        format: "truetype-variations",
      },
      {
        fontFamily: "Press Start 2P",
        fontStyle: "normal",
        fontWeight: "400",
        fontDisplay: "swap",
        srcPath: "fonts/Press_Start_2P/PressStart2P-Regular.ttf",
        format: "truetype",
      },
    ];

    fontFaces.forEach((font) => {
      const fontUrl = chrome.runtime.getURL(font.srcPath);
      const rule = `
        @font-face {
          font-family: "${font.fontFamily}";
          font-style: ${font.fontStyle};
          font-weight: ${font.fontWeight};
          font-display: ${font.fontDisplay};
          src: url('${fontUrl}') format('${font.format}');
        }
      `;
      styleSheet?.insertRule(rule, styleSheet.cssRules.length);
    });

    initialize_messaging();
    init_theme();
    get_settings()
      .then((settings) => {
        apply_theme_preference(settings.themePreference);
      })
      .catch((error) => {
        logger.warn("Unable to load saved content theme preference", error);
      });

    subscribe<ExtensionSettings>(
      EventType.SETTINGS_UPDATE,
      (event: MessageEvent<ExtensionSettings>) => {
        logger.debug("Content script received theme update", event.payload);
        apply_theme_preference(event.payload.themePreference);
      },
    );

    return mountPromptlyRoot();
  },
});
