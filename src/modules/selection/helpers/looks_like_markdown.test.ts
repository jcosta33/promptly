import { describe, it, expect } from "vitest";

import { looks_like_markdown } from "./looks_like_markdown";

describe("looks_like_markdown", () => {
  // Characterization: the helper counts how many of its 8 feature patterns
  // match and returns true only when at least 2 are present.

  describe("the >= 2 feature threshold", () => {
    it("returns false for plain prose with zero markdown features", () => {
      expect(looks_like_markdown("Just a normal sentence with no syntax.")).toBe(false);
    });

    it("returns false for a single feature alone (a lone header)", () => {
      // Matches only the header pattern -> 1 feature -> below the threshold.
      expect(looks_like_markdown("# Just a heading")).toBe(false);
    });

    it("returns false for a single feature alone (lone bold)", () => {
      // Matches only the bold/italic pattern -> 1 feature.
      expect(looks_like_markdown("here is some **bold** text")).toBe(false);
    });

    it("returns true at exactly two features (header + list)", () => {
      const text = "# Heading\n\n- a list item";
      expect(looks_like_markdown(text)).toBe(true);
    });

    it("returns true for bold + inline-code (two features)", () => {
      const text = "use **bold** and `inline code` together";
      expect(looks_like_markdown(text)).toBe(true);
    });

    it("returns true for a feature-rich document", () => {
      const text = [
        "# Title",
        "",
        "Some **bold** intro.",
        "",
        "- bullet one",
        "- bullet two",
        "",
        "> a blockquote",
      ].join("\n");
      expect(looks_like_markdown(text)).toBe(true);
    });
  });
});
