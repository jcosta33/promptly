import { initTheme } from "$/theme";
import { mountPromptlyRoot } from "@/src/modules/selection/presentations/views/SelectionRoot";

export default defineContentScript({
  matches: ["*://*/*"],

  main() {
    console.log("Promptly content script initialized");

    // Inject fonts
    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=JetBrains+Mono&family=Press+Start+2P&display=swap";
    document.head.appendChild(fontLink);
    initTheme();

    // Mount the Promptly component
    return mountPromptlyRoot();
  },
});
