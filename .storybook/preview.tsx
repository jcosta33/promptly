import type { Preview, Decorator } from "@storybook/react";
import React from "react";

import { initTheme, setTheme } from "../src/theme";
import "../src/normalize.css";

let currentDarkMode = initTheme();

export const globalTypes = {
  theme: {
    name: "Theme",
    description: "Global theme for components",
    defaultValue: currentDarkMode ? "dark" : "light",
    toolbar: {
      icon: "mirror",
      items: [
        { value: "light", icon: "circlehollow", title: "Light" },
        { value: "dark", icon: "circle", title: "Dark" },
      ],
      dynamicTitle: true,
    },
  },
};

const withTheme: Decorator = (StoryFn, context) => {
  const { theme } = context.globals;
  const darkMode = theme === "dark";

  setTheme(darkMode);

  return StoryFn();
};

const withNormalizationWrapper: Decorator = (StoryFn) => {
  return React.createElement("promptly-root", null, StoryFn());
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    actions: { argTypesRegex: "^on[A-Z].*" },
  },
  decorators: [withNormalizationWrapper, withTheme],
  globalTypes,
};

export default preview;
