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

    // content_security_policy: {
    //   extension_pages:
    //     "script-src 'self' 'wasm-unsafe-eval'; object-src 'none'; connect-src 'self' data: http://localhost:3000 https://huggingface.co https://cdn-lfs.huggingface.co https://cdn-lfs-us-1.huggingface.co https://raw.githubusercontent.com https://cdn-lfs-us-1.hf.co; default-src 'self'; style-src 'self' 'unsafe-inline'; style-src-elem 'self' https://cdnjs.cloudflare.com https://fonts.googleapis.com; font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com;",
    // },

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
