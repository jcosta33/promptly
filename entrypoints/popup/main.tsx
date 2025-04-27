import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { initTheme, setTheme } from "$/theme";
import { initialize_messaging } from "$/modules/messaging/use_cases/initialize_messaging";
import { subscribe } from "$/modules/messaging/repositories/message_bus";
import { EventType } from "$/modules/messaging/models/event_types";
import type { ExtensionSettings } from "$/modules/configuration/models/user_settings";
import type { MessageEvent } from "$/modules/messaging/helpers/create_message_event";

const root = createRoot(document.getElementById("root")!);

// Create a client
const queryClient = new QueryClient();

// Initialize messaging system to enable communication with background script
initialize_messaging();

// Apply initial theme
initTheme();

// Listen for theme updates from settings changes
subscribe<ExtensionSettings>(
  EventType.SETTINGS_UPDATE,
  (event: MessageEvent<ExtensionSettings>) => {
    const newThemePref = event.payload.themePreference;
    // Determine dark mode based on preference (could be moved to theme.ts)
    let darkMode = false;
    if (newThemePref === "dark") {
      darkMode = true;
    } else if (newThemePref === "system") {
      darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    setTheme(darkMode); // Apply the theme directly
  }
);

// Wrap App with QueryClientProvider
root.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
