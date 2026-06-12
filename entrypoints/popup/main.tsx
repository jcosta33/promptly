import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { apply_theme_preference, init_theme } from "$/theme";
import { initialize_messaging } from "$/modules/messaging/use_cases/initialize_messaging";
import { subscribe } from "$/modules/messaging/repositories/message_bus";
import { EventType } from "$/modules/messaging/models/event_types";
import type { ExtensionSettings } from "$/modules/configuration/models/user_settings";
import type { MessageEvent } from "$/modules/messaging/helpers/create_message_event";
import { get_settings } from "$/modules/configuration/use_cases/get_settings";
import { logger } from "$/utils/logger";
import "../normalize.css";

const root = createRoot(document.getElementById("root")!);

// Create a client
const queryClient = new QueryClient();

// Initialize messaging system to enable communication with background script
initialize_messaging();

// Apply initial theme
init_theme();
get_settings()
  .then((settings) => {
    apply_theme_preference(settings.themePreference);
  })
  .catch((error) => {
    logger.warn("Unable to load saved popup theme preference", error);
  });

// Listen for theme updates from settings changes
subscribe<ExtensionSettings>(
  EventType.SETTINGS_UPDATE,
  (event: MessageEvent<ExtensionSettings>) => {
    apply_theme_preference(event.payload.themePreference);
  },
);

// Wrap App with QueryClientProvider
root.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
);
