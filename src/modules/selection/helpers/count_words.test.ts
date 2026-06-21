import { describe, it, expect } from "vitest";

import { count_words } from "./count_words";

describe("count_words", () => {
  // Characterization: split on whitespace runs, drop empties, count the rest.
  // Empty string short-circuits to 0.

  it("returns 0 for an empty string", () => {
    expect(count_words("")).toBe(0);
  });

  it("returns 0 for whitespace only", () => {
    expect(count_words("   \n\t  ")).toBe(0);
  });

  it("counts a single word", () => {
    expect(count_words("hello")).toBe(1);
  });

  it("counts words separated by single spaces", () => {
    expect(count_words("the quick brown fox")).toBe(4);
  });

  it("collapses runs of mixed whitespace between words", () => {
    expect(count_words("  the   quick \n brown\tfox  ")).toBe(4);
  });

  it("counts hyphenated/punctuated tokens as one word each", () => {
    // No tokenisation beyond whitespace: punctuation stays attached.
    expect(count_words("well-being, really? yes.")).toBe(3);
  });
});
