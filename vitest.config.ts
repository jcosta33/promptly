import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

// Mirror the WXT/tsconfig "$" path alias (see .wxt/tsconfig.json) so tests can
// load modules that import via "$/..." (e.g. the actions catalogue).
const srcDir = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      $: srcDir,
    },
  },
  test: {
    // Other global test options here
  },
});
