// eslint.config.ts
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";
import globals from "globals";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
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
      "@typescript-eslint": tseslint.plugin,
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
      ...tseslint.configs.recommendedTypeChecked[0].rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...importPlugin.configs.recommended.rules,
      
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
      "import/no-named-as-default-member": "off",
      "arrow-body-style": "off",
      "no-console": "off",
      "no-restricted-imports": "off",
      "@typescript-eslint/prefer-for-of": "error",
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "eqeqeq": ["error", "always"],
      "curly": "error",
      "no-var": "error",
      "prefer-const": "error",
      "object-shorthand": ["error", "always"],
      "spaced-comment": ["error", "always", { "markers": ["/"] }],
      "import/order": "off",
      "import/no-unresolved": "off",
      "import/no-duplicates": "warn",
      "import/no-extraneous-dependencies": ["error", { "devDependencies": true }],
      "import/no-useless-path-segments": ["warn", { "noUselessIndex": true }]
    },
  },
  prettierConfig,
);
