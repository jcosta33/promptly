import postcssPrefixSelector from "postcss-prefix-selector";
import cssnano from "cssnano";

export default {
  plugins: [
    cssnano({ preset: "default" }),
    postcssPrefixSelector({
      prefix: "promptly-root",
      transform(_prefix, selector, prefixedSelector, file) {
        if (file.endsWith(".module.css")) {
          if (selector.startsWith(":root")) {
            return selector;
          }
          return prefixedSelector;
        }
        return selector;
      },
    }),
  ],
};
