// eslint.config.ts
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";
import globals from "globals";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  // Base configurations (TS, React, Imports)
  {
    files: ["./src/**/*.ts", "./src/**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: process.cwd(),
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      import: importPlugin,
    },
    settings: {
      react: {
        version: "19.0",
      },
      "import/resolver": {
        typescript: {
          project: "./.wxt/tsconfig.json",
          alwaysTryTypes: true,
        },
      },
      "import/extensions": [".ts", ".tsx"],
      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx"],
      },
      "import/internal-regex": "^\\$/",
    },
    rules: {
      // Base recommended rules (order matters less here)
      ...tseslint.configs.recommendedTypeChecked[0].rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...importPlugin.configs.recommended.rules,

      // Specific rule adjustments and additions
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "no-console": "warn",
      eqeqeq: ["error", "always"],
      curly: "error",
      "no-var": "error",
      "prefer-const": "error",
      "arrow-body-style": ["error", "always"],
      "object-shorthand": ["error", "always"],
      "spaced-comment": ["error", "always", { markers: ["/"] }],
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "object",
            "type",
          ],
          pathGroups: [
            // Add path groups if needed, e.g.:
            // { pattern: "@/**", group: "internal" }
          ],
          pathGroupsExcludedImportTypes: [],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "import/no-unresolved": "off", // Rely on TypeScript
      "import/no-duplicates": "warn",
      "import/no-extraneous-dependencies": ["error", { devDependencies: true }],
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            {
              group: ["../../*"],
              message:
                "Usage of relative parent imports is discouraged. Use '$/*' alias instead.",
            },
          ],
        },
      ],
      "import/no-useless-path-segments": ["warn", { noUselessIndex: true }],
    },
  },
  // Apply Prettier rules last to disable conflicting style rules
  prettierConfig
);

// Note: If using eslint-plugin-import with TypeScript, you might need
// npm install -D eslint-import-resolver-typescript
