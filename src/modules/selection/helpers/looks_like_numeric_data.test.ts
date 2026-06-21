import { describe, it, expect } from "vitest";

import { looks_like_numeric_data } from "./looks_like_numeric_data";

describe("looks_like_numeric_data", () => {
  // Characterization: two ways to be "numeric data" —
  //   (A) strictly more than 50% of whitespace-split words are bare numbers, or
  //   (B) one of the numeric/statistical patterns matches.

  describe("the >50%-numeric-words branch", () => {
    it("returns false for empty / whitespace-only input (no words)", () => {
      expect(looks_like_numeric_data("")).toBe(false);
      expect(looks_like_numeric_data("   ")).toBe(false);
    });

    it("returns true when every word is a number", () => {
      expect(looks_like_numeric_data("1 2 3 4 5")).toBe(true);
    });

    it("returns true when numbers are a strict majority (2 of 3)", () => {
      expect(looks_like_numeric_data("12 7 apples")).toBe(true);
    });

    it("returns false at exactly 50% — the threshold is strictly greater-than", () => {
      // 1 of 2 words is numeric => ratio 0.5, which is NOT > 0.5.
      expect(looks_like_numeric_data("42 apples")).toBe(false);
    });

    it("returns false for ordinary prose with no numbers", () => {
      expect(looks_like_numeric_data("the quick brown fox")).toBe(false);
    });

    it("recognises signed, decimal and scientific notation as numeric words", () => {
      expect(looks_like_numeric_data("-3.5 2.0e10 +7")).toBe(true);
    });
  });

  describe("the numeric-pattern branch", () => {
    it("returns true on a measurement even when most words are prose", () => {
      expect(looks_like_numeric_data("the parcel weighs 5kg in total")).toBe(true);
    });

    it("returns true on a statistical term", () => {
      expect(looks_like_numeric_data("the mean of the distribution")).toBe(true);
    });

    it("returns true on plus-minus notation", () => {
      expect(looks_like_numeric_data("measured 10 ± 2 across runs")).toBe(true);
    });

    it("returns true on the multiplication-sign pattern", () => {
      expect(looks_like_numeric_data("a grid of 3 × 4 cells")).toBe(true);
    });
  });
});
