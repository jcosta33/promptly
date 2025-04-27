import { createRoot } from "react-dom/client";
import App from "./App";
import { initTheme } from "$/theme";
import { initialize_messaging } from "$/modules/messaging/use_cases/initialize_messaging";

const root = createRoot(document.getElementById("root")!);

// Initialize messaging system to enable communication with background script
initialize_messaging();

initTheme();

root.render(<App />);
