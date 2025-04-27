import { defineConfig } from "wxt";
import { resolve } from "node:path";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],

  alias: {
    $: resolve("src"),
  },

  webExt: {
    startUrls: [
      "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise",
      "https://stackoverflow.com/questions/14220321/how-do-i-return-the-response-from-an-asynchronous-call",
      "https://www.theverge.com/reviews/650608/framework-laptop-13-review-2025-amd-ryzen-ai-300",
    ],
  },

  vite: () => {
    return {
      css: {
        modules: {
          localsConvention: "camelCaseOnly",
          scopeBehaviour: "local",
        },
      },
    };
  },

  manifest: {
    name: "Promptly",
    description:
      "Select text on any website and analyze it using WebLLM models that run directly in your browser.",
    content_security_policy: {
      extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'; connect-src 'self' data: http://localhost:8000 https://huggingface.co https://cdn-lfs.huggingface.co https://cdn-lfs-us-1.huggingface.co https://raw.githubusercontent.com https://cdn-lfs-us-1.hf.co; default-src 'self'; style-src-elem 'self' https://cdnjs.cloudflare.com; font-src 'self' https://cdnjs.cloudflare.com;"
    },
    permissions: ["storage", "tabs"],
    host_permissions: ["<all_urls>"],
    action: {
      default_popup: "popup/index.html",
      default_title: "Promptly",
    },
    web_accessible_resources: [
      {
        resources: ["assets/*"],
        matches: ["<all_urls>"],
      },
    ],
    commands: {
      _execute_action: {
        suggested_key: {
          default: "Alt+S",
        },
        description: "Open Promptly popup",
      },
    },
  },
});
